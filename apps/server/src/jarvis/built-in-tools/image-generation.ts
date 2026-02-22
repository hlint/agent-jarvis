import path from "node:path";
import type { AttachmentEntry } from "@repo/shared/defines/jarvis";
import { timeFormat } from "@repo/shared/lib/time";
import { shortId } from "@repo/shared/lib/utils";
import { getImageModel } from "@repo/shared/llm/get-model";
import { generateImage } from "ai";
import fs from "fs-extra";
import mime from "mime-types";
import { z } from "zod";
import { aiImageGenerationProvider } from "../ai-providers";
import { DIR_RUNTIME, DIR_TMP } from "../defines";
import { defineJarvisTool } from "../tool";

const MAX_REF_IMAGES = 5;
const MAX_REF_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB

const toolDisabled = !aiImageGenerationProvider;
const toolDisabledMessage =
  "Tool disabled due to missing IMAGE_GENERATION provider.";

function resolvePath(inputPath: string): string {
  return path.isAbsolute(inputPath)
    ? inputPath
    : path.join(path.resolve(DIR_RUNTIME), inputPath);
}

function isUrl(s: string): boolean {
  return /^https?:\/\//i.test(s);
}

async function loadReferenceImage(
  fileInput: string,
): Promise<ArrayBuffer | string> {
  if (isUrl(fileInput)) {
    const res = await fetch(fileInput);
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_REF_IMAGE_SIZE) {
      throw new Error(
        `Reference image too large (max ${MAX_REF_IMAGE_SIZE / 1024 / 1024}MB)`,
      );
    }
    return buf;
  }
  const resolvedPath = resolvePath(fileInput);
  if (!(await fs.pathExists(resolvedPath))) {
    throw new Error(`File not found: ${resolvedPath}`);
  }
  const stat = await fs.stat(resolvedPath);
  if (!stat.isFile()) {
    throw new Error(`Not a file: ${resolvedPath}`);
  }
  if (stat.size > MAX_REF_IMAGE_SIZE) {
    throw new Error(
      `Reference image too large (max ${MAX_REF_IMAGE_SIZE / 1024 / 1024}MB): ${resolvedPath}`,
    );
  }
  const mediaType = mime.lookup(resolvedPath) || "";
  if (!mediaType.startsWith("image/")) {
    throw new Error(`Not an image file: ${resolvedPath}`);
  }
  return Bun.file(resolvedPath).arrayBuffer();
}

const imageGenerationTool = defineJarvisTool({
  name: "image-generation",
  description:
    "Generate images using a sub-AI with image generation capability. Supports text-to-image and image-to-image (use reference images for style transfer, edits, or variations). " +
    (toolDisabled
      ? `(${toolDisabledMessage})`
      : `(Image model: ${aiImageGenerationProvider!.model})`),
  inputSchema: z.object({
    prompt: z
      .string()
      .min(1)
      .describe(
        "Text description of the image to generate (e.g. 'A cat wearing a hat', 'Put a donut next to the flour')",
      ),
    referenceImages: z
      .array(z.string().min(1))
      .max(MAX_REF_IMAGES)
      .optional()
      .describe(
        "Optional. Image paths (absolute or relative to runtime) or URLs to use as reference. Models like fal-ai/flux-pro/kontext support this for edits and variations.",
      ),
    aspectRatio: z
      .enum(["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3"])
      .optional()
      .describe("Optional aspect ratio for the generated image."),
  }),
  execute: async (input, jarvis) => {
    if (toolDisabled) {
      throw new Error(toolDisabledMessage);
    }

    const { prompt, referenceImages = [], aspectRatio } = input;

    const model = getImageModel(aiImageGenerationProvider!);

    const promptArg =
      referenceImages.length > 0
        ? {
            text: prompt,
            images: await Promise.all(
              referenceImages.map((f) => loadReferenceImage(f)),
            ),
          }
        : prompt;

    const result = await generateImage({
      model,
      prompt: promptArg,
      n: 1,
      ...(aspectRatio && { aspectRatio }),
    });

    const image = result.image ?? result.images?.[0];
    if (!image) {
      throw new Error("No image was generated");
    }

    await fs.ensureDir(DIR_TMP);
    const ext = image.mediaType?.includes("png") ? "png" : "jpg";
    const filename = `generated-${shortId()}.${ext}`;
    const filePath = path.join(DIR_TMP, filename);
    const data =
      image.uint8Array ??
      (image.base64
        ? Buffer.from(image.base64, "base64")
        : (() => {
            throw new Error("No image data");
          })());
    await Bun.write(filePath, data);

    const stat = await fs.stat(filePath);
    const entry: AttachmentEntry = {
      id: shortId(),
      role: "attachment",
      from: "assistant",
      channel: "tool-call",
      createdAt: Date.now(),
      createdTime: timeFormat(),
      data: {
        type: "local-file",
        originalName: filename,
        fileType: image.mediaType ?? "image/png",
        fileSize: stat.size,
        filePath,
      },
    };
    jarvis.pushHistoryEntry(entry);

    return {
      success: true,
      path: filePath,
      filename,
      message: "Image generated and displayed.",
    };
  },
});

export default imageGenerationTool;

import path from "node:path";
import type { AttachmentEntry } from "@repo/shared/defines/jarvis";
import { timeFormat } from "@repo/shared/lib/time";
import { shortId } from "@repo/shared/lib/utils";
import { getImageModel } from "@repo/shared/llm/get-model";
import { generateImage } from "ai";
import fs from "fs-extra";
import mime from "mime-types";
import { z } from "zod";
import { DIR_RUNTIME } from "../defines";
import { defineJarvisTool } from "../tool";

const MAX_REF_IMAGES = 5;
const MAX_REF_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB

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
  description: (jarvis) =>
    "Generate images using a sub-AI with image generation capability. Supports text-to-image and image-to-image (use reference images for style transfer, edits, or variations). " +
    (jarvis.config.getAiProvider("IMAGE_GENERATION")?.model
      ? `(Image model: ${jarvis.config.getAiProvider("IMAGE_GENERATION")!.model})`
      : "DISABLED due to missing image generation provider"),
  inputSchema: z.object({
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
    outputPath: z
      .string()
      .min(1)
      .optional()
      .describe(
        "Optional. Output file path without extension (e.g. 'images/blog/hero'). If relative, it is resolved against the runtime directory.",
      ),
    autoAttach: z
      .boolean()
      .optional()
      .describe(
        "Optional. Whether to automatically attach and display the generated image to the user. Defaults to true.",
      ),
  }),
  inputContentDescription:
    "Text description of the image to generate (e.g. 'A cat wearing a hat', 'Put a donut next to the flour')",
  execute: async (input, jarvis) => {
    const provider = jarvis.config.getAiProvider("IMAGE_GENERATION");
    if (!provider) {
      throw new Error(
        "Image generation tool disabled due to missing provider.",
      );
    }

    const {
      content,
      referenceImages = [],
      aspectRatio,
      outputPath = path.join("tmp", `generated-${shortId()}`),
      autoAttach = true,
    } = input;
    const prompt = content ?? "";

    const model = getImageModel(provider);

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
      providerOptions: provider.providerOptions,
      prompt: promptArg,
      n: 1,
      ...(aspectRatio && { aspectRatio }),
    });

    const image = result.image ?? result.images?.[0];
    if (!image) {
      throw new Error("No image was generated");
    }

    const ext =
      (image.mediaType ? mime.extension(image.mediaType) : null) || "png";

    const basePath = resolvePath(outputPath);
    await fs.ensureDir(path.dirname(basePath));
    const filePath = `${basePath}.${ext}`;
    const filename = path.basename(filePath);
    const data =
      image.uint8Array ??
      (image.base64
        ? Buffer.from(image.base64, "base64")
        : (() => {
            throw new Error("No image data");
          })());
    await Bun.write(filePath, data);

    if (autoAttach) {
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
    }

    return {
      success: true,
      path: filePath,
      filename,
      message: autoAttach
        ? "Image generated and displayed."
        : "Image generated.",
    };
  },
});

export default imageGenerationTool;

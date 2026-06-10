import path, { join } from "node:path";
import { generateImage, tool } from "ai";
import fs from "fs-extra";
import mime from "mime-types";
import z from "zod";
import { createImageModel } from "../../../lib/create-ai-model";
import { resolveSafeFilename } from "../../../lib/file";
import type Jarvis from "../..";
import { DIR_SESSIONS } from "../../defines";
import { PATH_DESC, resolvePath, toDisplayPath } from "../file/path";

const MAX_REF_IMAGES = 5;
const MAX_REF_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB

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

export default function createImageGenerationTool(
  jarvis: Jarvis,
  sessionId: string,
) {
  const imageProvider = jarvis.config.getAiProvider("IMAGE_GENERATION");

  return tool({
    description:
      "Generate images using a sub-AI with image generation capability. Supports text-to-image and image-to-image (use reference images for style transfer, edits, or variations). By default images are saved under the current session's artifacts directory; use `dir` to override. " +
      (imageProvider
        ? `(Image model: ${imageProvider.model})`
        : "DISABLED due to missing image generation provider"),
    inputSchema: z.object({
      prompt: z
        .string()
        .min(1)
        .describe(
          "Text description of the image to generate (e.g. 'A cat wearing a hat')",
        ),
      filename: z
        .string()
        .min(1)
        .describe(
          "Expected save filename, e.g. cat.png. The saved extension follows the generated image format.",
        ),
      dir: z
        .string()
        .optional()
        .describe(
          `Directory to save the generated image. ${PATH_DESC} Defaults to the current session's artifacts directory.`,
        ),
      referenceImages: z
        .array(z.string().min(1))
        .max(MAX_REF_IMAGES)
        .optional()
        .describe(
          "Optional runtime-relative or absolute image file paths, or http(s) URLs as reference for edits and variations.",
        ),
      aspectRatio: z
        .enum(["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3"])
        .optional()
        .describe("Optional aspect ratio for the generated image."),
    }),
    inputExamples: [
      {
        input: {
          prompt: "A cat wearing a red hat, studio photo",
          filename: "cat.png",
        },
      },
    ],
    execute: async (input) => {
      const provider = jarvis.config.getAiProvider("IMAGE_GENERATION");
      if (!provider) {
        throw new Error(
          "Image generation tool disabled due to missing provider.",
        );
      }

      const {
        filename,
        prompt,
        referenceImages = [],
        aspectRatio,
        dir,
      } = input;
      const model = createImageModel(provider);

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
        providerOptions: jarvis.config.getProviderOptions(),
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

      const saveDir = dir
        ? resolvePath(dir)
        : join(DIR_SESSIONS, sessionId, "artifacts");
      await fs.ensureDir(saveDir);
      const filePath = await resolveSafeFilename(saveDir, filename, { ext });
      const savedFilename = path.basename(filePath);

      const data =
        image.uint8Array ??
        (image.base64
          ? Buffer.from(image.base64, "base64")
          : (() => {
              throw new Error("No image data");
            })());
      await Bun.write(filePath, data);

      return {
        success: true,
        path: toDisplayPath(filePath),
        filename: savedFilename,
        message: "Image generated.",
      };
    },
  });
}

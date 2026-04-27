import path from "node:path";
import { streamTextOptions } from "@repo/shared/agent/defines/constant";
import { getLanguageModel } from "@repo/shared/llm/get-model";
import { generateText } from "ai";
import fs from "fs-extra";
import mime from "mime-types";
import { z } from "zod";
import { DIR_RUNTIME } from "../defines";
import { defineJarvisTool } from "../tool";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_FILES = 3;

const FILETYPE_TO_DUTY = {
  audio: "VOICE_RECOGNITION",
  video: "VIDEO_RECOGNITION",
  image: "IMAGE_RECOGNITION",
  other: "OTHER_RECOGNITION",
} as const;

function resolvePath(inputPath: string): string {
  return path.isAbsolute(inputPath)
    ? inputPath
    : path.join(path.resolve(DIR_RUNTIME), inputPath);
}

function isUrl(s: string): boolean {
  return /^https?:\/\//i.test(s);
}

function getMediaTypeFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname);
    return mime.lookup(ext) || "application/octet-stream";
  } catch {
    return "application/octet-stream";
  }
}

function normalizeMediaType(mediaType: string): string {
  if (mediaType === "video/webm") return "audio/webm";
  return mediaType;
}

function isImageMediaType(mediaType: string): boolean {
  return mediaType.startsWith("image/");
}

const multimodalSubagentTool = defineJarvisTool({
  name: "multimodal-subagent",
  description:
    "Delegate file understanding to a multimodal sub-AI. Use when you need to process files the main AI cannot read: transcribe audio, read PDF, analyze images, summarize documents. The sub-AI understands these files. ",
  inputSchema: z.object({
    fileType: z.enum(["audio", "video", "image", "other"]),
    files: z
      .array(z.string().min(1))
      .min(1)
      .max(MAX_FILES)
      .describe(
        "File paths (absolute or relative to runtime) or http(s) URLs. Examples: /path/to/audio.mp3, https://example.com/doc.pdf",
      ),
  }),
  inputContentDescription:
    "Instruction for the sub-AI (e.g. 'Transcribe this audio', 'Summarize this PDF', 'Describe what you see in these images')",

  execute: async (input, jarvis) => {
    const { content: instruction, files, fileType } = input;
    const duty = FILETYPE_TO_DUTY[fileType];
    const provider = jarvis.config.getAiProvider(duty);
    if (!provider) {
      throw new Error(
        `No provider configured for ${fileType} (duty: ${duty}). Add a provider with duties including "${duty}" in config.`,
      );
    }
    type ContentPart =
      | { type: "text"; text: string }
      | { type: "image"; image: ArrayBuffer | URL; mediaType?: string }
      | { type: "file"; data: ArrayBuffer | URL; mediaType: string };

    const contentParts: ContentPart[] = [
      { type: "text", text: instruction ?? "" },
    ];

    for (const fileInput of files) {
      let mediaType: string;
      let dataOrUrl: ArrayBuffer | URL;

      if (isUrl(fileInput)) {
        mediaType = normalizeMediaType(getMediaTypeFromUrl(fileInput));
        dataOrUrl = new URL(fileInput);
      } else {
        const resolvedPath = resolvePath(fileInput);
        if (!(await fs.pathExists(resolvedPath))) {
          throw new Error(`File not found: ${resolvedPath}`);
        }
        const stat = await fs.stat(resolvedPath);
        if (!stat.isFile()) {
          throw new Error(`Not a file: ${resolvedPath}`);
        }
        if (stat.size > MAX_FILE_SIZE) {
          throw new Error(
            `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB): ${resolvedPath}`,
          );
        }
        mediaType = normalizeMediaType(
          mime.lookup(resolvedPath) || "application/octet-stream",
        );
        dataOrUrl = await Bun.file(resolvedPath).arrayBuffer();
      }

      if (isImageMediaType(mediaType)) {
        contentParts.push({ type: "image", image: dataOrUrl, mediaType });
      } else {
        contentParts.push({ type: "file", data: dataOrUrl, mediaType });
      }
    }

    const { text } = await generateText({
      model: getLanguageModel(provider),
      providerOptions: jarvis.config.getProviderOptions(),
      ...streamTextOptions,
      messages: [
        {
          role: "user",
          content: contentParts,
        },
      ],
    });

    return text;
  },
});

export default multimodalSubagentTool;

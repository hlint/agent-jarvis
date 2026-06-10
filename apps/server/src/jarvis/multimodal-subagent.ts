import path, { join } from "node:path";
import { streamTextOptions } from "@repo/shared/defines/constant";
import { generateText } from "ai";
import fs from "fs-extra";
import mime from "mime-types";
import z from "zod";
import { type AiProvider, createLanguageModel } from "../lib/create-ai-model";
import type Jarvis from ".";
import { DIR_TMP } from "./defines";
import { resolvePath } from "./tools/file/path";

const TRANSCRIBE_INSTRUCTION =
  "Transcribe this audio verbatim. Return only the transcript text, without commentary.";

export class VoiceRecognitionUnavailableError extends Error {
  constructor(
    message = "Voice recognition is not configured. Add VOICE_RECOGNITION to a provider in config.json.",
  ) {
    super(message);
    this.name = "VoiceRecognitionUnavailableError";
  }
}

export const MAX_MULTIMODAL_FILE_SIZE = 20 * 1024 * 1024; // 20MB
export const MAX_MULTIMODAL_FILES = 3;

export const multimodalFileTypeSchema = z.enum([
  "audio",
  "video",
  "image",
  "other",
]);
export type MultimodalFileType = z.infer<typeof multimodalFileTypeSchema>;

export const FILETYPE_TO_DUTY = {
  audio: "VOICE_RECOGNITION",
  video: "VIDEO_RECOGNITION",
  image: "IMAGE_RECOGNITION",
  other: "OTHER_RECOGNITION",
} as const;

export const multimodalSubagentInputSchema = z.object({
  fileType: multimodalFileTypeSchema,
  files: z
    .array(z.string().min(1))
    .min(1)
    .max(MAX_MULTIMODAL_FILES)
    .describe("Runtime-relative file paths, absolute paths, or http(s) URLs"),
  instruction: z
    .string()
    .min(1)
    .describe(
      "Instruction for the sub-AI (e.g. transcribe, describe images, summarize a document)",
    ),
});

export const multimodalSubagentOutputSchema = z.object({
  text: z.string(),
});

export type MultimodalSubagentInput = z.infer<
  typeof multimodalSubagentInputSchema
>;
export type MultimodalSubagentOutput = z.infer<
  typeof multimodalSubagentOutputSchema
>;

type ContentPart =
  | { type: "text"; text: string }
  | { type: "image"; image: ArrayBuffer | URL; mediaType?: string }
  | { type: "file"; data: ArrayBuffer | URL; mediaType: string };

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

export default class JarvisMultimodalSubagent {
  private readonly jarvis: Jarvis;

  constructor(jarvis: Jarvis) {
    this.jarvis = jarvis;
  }

  /** Tool-like entry: validated input → structured output. */
  async run(input: MultimodalSubagentInput): Promise<MultimodalSubagentOutput> {
    const parsed = multimodalSubagentInputSchema.parse(input);
    const text = await this.invoke(parsed);
    return multimodalSubagentOutputSchema.parse({ text });
  }

  async transcribe(audio: File): Promise<MultimodalSubagentOutput> {
    if (!this.jarvis.config.isVoiceRecognitionAvailable()) {
      throw new VoiceRecognitionUnavailableError();
    }

    await fs.ensureDir(DIR_TMP);
    const ext = path.extname(audio.name) || ".webm";
    const tempPath = join(DIR_TMP, `stt-${crypto.randomUUID()}${ext}`);

    try {
      await Bun.write(tempPath, audio);
      return await this.run({
        fileType: "audio",
        files: [tempPath],
        instruction: TRANSCRIBE_INSTRUCTION,
      });
    } finally {
      await fs.remove(tempPath).catch(() => {});
    }
  }

  private async invoke(input: MultimodalSubagentInput): Promise<string> {
    const { fileType, files, instruction } = input;
    const duty = FILETYPE_TO_DUTY[fileType];
    const provider = this.jarvis.config.getAiProvider(duty);
    if (!provider) {
      throw new Error(
        `No provider configured for ${fileType} (duty: ${duty}). Add a provider with duties including "${duty}" in config.json.`,
      );
    }

    const contentParts: ContentPart[] = [{ type: "text", text: instruction }];

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
        if (stat.size > MAX_MULTIMODAL_FILE_SIZE) {
          throw new Error(
            `File too large (max ${MAX_MULTIMODAL_FILE_SIZE / 1024 / 1024}MB): ${resolvedPath}`,
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
      model: createLanguageModel(provider as AiProvider),
      providerOptions: this.jarvis.config.getProviderOptions(),
      ...streamTextOptions,
      messages: [{ role: "user", content: contentParts }],
    });

    return text;
  }
}

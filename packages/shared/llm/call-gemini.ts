import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { type ModelMessage, streamText } from "ai";
import mime from "mime-types";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export type LlmGeminiDialog = Array<
  | {
      role: "user" | "assistant";
      content: string;
      filePath?: string;
    }
  | {
      role: "system";
      content: string;
    }
>;

async function readFileSafe(
  path: string,
): Promise<{ base64: string; mediaType: string } | null> {
  try {
    const file = Bun.file(path);
    const size = file.size;
    if (size > MAX_FILE_SIZE) return null;
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    let mediaType = mime.lookup(path) || "application/octet-stream";
    if (mediaType === "video/webm") {
      mediaType = "audio/webm";
    }
    return { base64, mediaType };
  } catch {
    return null;
  }
}

export default async function callGemini({
  dialog,
  onStream = () => {},
  apiKey,
  baseURL,
  model: modelName,
}: {
  dialog: LlmGeminiDialog;
  onStream?: (content: string) => void | Promise<void>;
  apiKey: string;
  baseURL?: string;
  model: string;
}) {
  const google = createGoogleGenerativeAI({
    apiKey,
    ...(baseURL && { baseURL }),
  });

  const messages: ModelMessage[] = [];

  for (const message of dialog) {
    if (message.role === "system") {
      messages.push({ role: "system", content: message.content });
      continue;
    }

    const { role, content } = message;
    const parts: Array<
      | { type: "text"; text: string }
      | { type: "file"; data: string; mediaType: string }
    > = [];

    if (content) parts.push({ type: "text", text: content });

    if ("filePath" in message && message.filePath) {
      const file = await readFileSafe(message.filePath);
      if (file) {
        parts.push({
          type: "file",
          data: file.base64,
          mediaType: file.mediaType,
        });
      } else {
        parts.push({
          type: "text",
          text: "[File skipped: exceeds 20MB or unreadable]",
        });
      }
    }

    const first = parts[0];
    messages.push({
      role: role === "user" ? "user" : "assistant",
      content:
        parts.length === 1 && first?.type === "text" ? first.text : parts,
    } as ModelMessage);
  }

  const { fullStream, totalUsage, text } = streamText({
    model: google(modelName),
    messages,
  });

  let accumulated = "";
  for await (const chunk of fullStream) {
    if (chunk.type === "text-delta") {
      accumulated += chunk.text;
      await onStream(accumulated);
    }
  }

  const usage = await totalUsage;
  return {
    totalUsage: {
      prompt_tokens: usage.inputTokens ?? 0,
      completion_tokens: usage.outputTokens ?? 0,
      total_tokens: usage.totalTokens ?? 0,
    },
    text: await text,
  };
}

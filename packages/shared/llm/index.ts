import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { type ModelMessage, streamText } from "ai";
import mime from "mime-types";
import type { LlmDialog } from "./types";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

async function readFileSafe(
  path: string,
): Promise<{ data: Uint8Array; mediaType: string } | null> {
  try {
    const file = Bun.file(path);
    const size = file.size;
    if (size > MAX_FILE_SIZE) return null;
    const buffer = await file.arrayBuffer();
    return {
      data: new Uint8Array(buffer),
      mediaType: mime.lookup(path) || "application/octet-stream",
    };
  } catch {
    return null;
  }
}

export default async function callLlm({
  dialog,
  onStream = () => {},
  apiKey,
  baseURL,
  model,
}: {
  dialog: LlmDialog;
  onStream?: (content: string) => void | Promise<void>;
  apiKey: string;
  baseURL?: string;
  model: string;
}) {
  const client = getModel({ apiKey, baseURL, model });
  const messages: ModelMessage[] = [];
  for (const message of dialog) {
    const { role, content } = message;
    if (role === "system") {
      messages.push({ role, content } satisfies ModelMessage);
    } else if (message.filePath) {
      const file = await readFileSafe(message.filePath);
      messages.push({
        role,
        content: file
          ? [
              {
                type: "text",
                text: content,
              },
              { type: "file", data: file.data, mediaType: file.mediaType },
            ]
          : content,
      } satisfies ModelMessage);
    } else {
      messages.push({ role, content } satisfies ModelMessage);
    }
  }
  const { fullStream, totalUsage, text } = streamText({
    model: client,
    messages,
  });
  let content = "";
  for await (const chunk of fullStream) {
    if (chunk.type === "text-delta") {
      content += chunk.text;
      await onStream(content);
    }
  }
  return {
    totalUsage: await totalUsage,
    text: await text,
  };
}

function getModel({
  apiKey,
  baseURL,
  model,
}: {
  apiKey: string;
  baseURL?: string;
  model: string;
}) {
  return createOpenAICompatible({
    apiKey,
    baseURL: baseURL || "",
    name: "model-provider",
  })(model);
}

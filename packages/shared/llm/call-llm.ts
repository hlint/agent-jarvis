import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { type ModelMessage, streamText } from "ai";

export type LlmDialog = Array<{
  role: "user" | "assistant" | "system";
  content: string;
}>;

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
    messages.push({ role, content } satisfies ModelMessage);
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

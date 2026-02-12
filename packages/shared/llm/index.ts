import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import type { LlmDialog } from "./types";

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
  const { fullStream, totalUsage, text } = streamText({
    model: client,
    messages: dialog,
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
  return createOpenAI({
    apiKey,
    baseURL,
  })(model);
}

import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import OpenAI from "openai";
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
  const client = new OpenAI({
    apiKey,
    baseURL,
    defaultHeaders: {
      "User-Agent": "Mozilla/5.0",
    },
  });
  const response = await client.chat.completions.create({
    model,
    messages: dialog,
    stream: true,
  });
  let content = "";
  for await (const chunk of response) {
    content += chunk.choices[0]?.delta.content ?? "";
    await onStream(content);
  }
  return {
    totalUsage: -1,
    text: content,
  };
}

export async function callLlm2({
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
  const client = getModel2({ apiKey, baseURL, model });
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

function getModel2({
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

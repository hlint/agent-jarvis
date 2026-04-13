import type z from "zod";
import type { AgentTool } from "../defines/tool";

function firstOpenJsonFence(
  result: string,
): { index: number; matchLen: number } | null {
  const m = result.match(/```\s*json\s*\n?/);
  if (!m || m.index === undefined) return null;
  return { index: m.index, matchLen: m[0].length };
}

function lastOpenJsonFence(
  result: string,
): { index: number; matchLen: number } | null {
  let best: { index: number; matchLen: number } | null = null;
  for (const m of result.matchAll(/```\s*json\s*\n?/g)) {
    if (m.index !== undefined) {
      best = { index: m.index, matchLen: m[0].length };
    }
  }
  return best;
}

/**
 * Parse a prompt string with parameters.
 * @param prompt - The prompt string to parse.
 * @param params - The parameters to parse the prompt with.
 * @example
 * parsePrompt("Hello, {name}!", { name: "John" }) // "Hello, John!"
 * @returns The parsed prompt string.
 */
export function parsePrompt(prompt: string, params: Record<string, string>) {
  return prompt.replace(/\{([^{}]+)\}/g, (_, p1) => params[p1] ?? _);
}

export function parseThinkMarkdownAndAction<T>(
  result: string,
  jsonSchema: z.ZodSchema<T>,
) {
  const fence = lastOpenJsonFence(result);
  if (!fence) {
    console.log(result);
    throw new Error("Expected a trailing ```json ... ``` code block");
  }
  const afterOpen = result.slice(fence.index + fence.matchLen);
  const closeIdx = afterOpen.indexOf("```");
  if (closeIdx === -1) {
    console.log(result);
    throw new Error("Unclosed ```json code block");
  }
  const jsonRaw = afterOpen.slice(0, closeIdx).trim();
  const text = result.slice(0, fence.index).trimEnd();
  const afterClose = afterOpen.slice(closeIdx + 3).trim();
  if (afterClose.length > 0) {
    throw new Error("Unexpected content after JSON code block");
  }
  return [text, jsonSchema.parse(betterJsonParse(jsonRaw))] as const;
}

/**
 * Markdown to show while the think stream is still in progress. Aligns with
 * {@link parseThinkMarkdownAndAction} when the reply ends with one trailing ```json block:
 * earlier ```json fences (e.g. examples) stay visible once closed; only the last fence
 * hides the following content until its closing ``` arrives.
 */
export function extractStreamingThinkMarkdown(result: string) {
  const fence = lastOpenJsonFence(result);
  if (!fence) return result.trimEnd();
  const afterOpen = result.slice(fence.index + fence.matchLen);
  if (!afterOpen.includes("```")) {
    return result.slice(0, fence.index).trimEnd();
  }
  return result.trimEnd();
}

export function betterJsonParse(jsonStr: string) {
  const match = jsonStr.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON object found in string");
  return JSON.parse(match[0]);
}

/**
 * Composite tool-parameter reply: ```json ... ``` then a newline, then raw long
 * text as `content` (matches getToolParamsPrompt composite rules).
 *
 * Uses the **first** ```json fence so long text may contain its own fenced
 * blocks (e.g. markdown docs) without being mistaken for the parameter JSON.
 */
export function parseCompositeToolParamsOutput<T>(
  raw: string,
  jsonSchema: z.ZodSchema<T>,
): T & { content: string } {
  const fence = firstOpenJsonFence(raw);
  if (!fence) {
    throw new Error("Expected a ```json ... ``` code block");
  }
  const afterOpen = raw.slice(fence.index + fence.matchLen);
  const closeIdx = afterOpen.indexOf("```");
  if (closeIdx === -1) {
    throw new Error("Unclosed ```json code block");
  }
  const jsonRaw = afterOpen.slice(0, closeIdx).trim();
  let afterClose = afterOpen.slice(closeIdx + 3);
  if (afterClose.startsWith("\r\n")) {
    afterClose = afterClose.slice(2);
  } else if (afterClose.startsWith("\n")) {
    afterClose = afterClose.slice(1);
  } else if (afterClose.startsWith("\r")) {
    afterClose = afterClose.slice(1);
  }
  const longText = afterClose;

  const jsonValue = jsonSchema.parse(betterJsonParse(jsonRaw));
  return { ...jsonValue, content: longText } as T & { content: string };
}

export function getToolsInfo(tools: AgentTool[]) {
  return JSON.stringify(
    tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema.toJSONSchema(),
      ...(tool.inputContentDescription != null &&
      tool.inputContentDescription !== ""
        ? { inputContentDescription: tool.inputContentDescription }
        : {}),
    })),
  );
}

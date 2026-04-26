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
 * When the last ```json fence has no closing ```, treat everything after the
 * opening fence as the JSON body (models occasionally truncate the fence).
 */
function parseThinkWhenClosingFenceMissing<T>(
  result: string,
  fence: { index: number; matchLen: number },
  afterOpen: string,
  jsonSchema: z.ZodSchema<T>,
): [string, T] {
  const jsonRaw = afterOpen.trim();
  if (!jsonRaw) {
    throw new Error("Unclosed ```json code block (empty after opening fence)");
  }
  const text = result.slice(0, fence.index).trimEnd();
  try {
    return [text, jsonSchema.parse(betterJsonParse(jsonRaw))] as const;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Unclosed \`\`\`json code block: could not parse body as action JSON: ${message}`,
    );
  }
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
    throw new Error("Expected a trailing ```json ... ``` code block");
  }
  const afterOpen = result.slice(fence.index + fence.matchLen);
  const closeIdx = afterOpen.indexOf("```");
  if (closeIdx === -1) {
    return parseThinkWhenClosingFenceMissing(
      result,
      fence,
      afterOpen,
      jsonSchema,
    );
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

/** First ``` after JSON fence, same as existing composite long-text join rules. */
function stripOneLeadingNewline(s: string): string {
  if (s.startsWith("\r\n")) return s.slice(2);
  if (s.startsWith("\n")) return s.slice(1);
  if (s.startsWith("\r")) return s.slice(1);
  return s;
}

/**
 * Find the first top-level JSON object in `s` by brace depth, respecting
 * string literals, so the tail can be long `content` without greedy-regex bugs.
 */
function splitLeadingJsonObject(
  s: string,
): { json: string; rest: string } | null {
  const from = s.indexOf("{");
  if (from === -1) return null;
  let depth = 0;
  let inString = false;
  let escapeNext = false;
  for (let p = from; p < s.length; p++) {
    const c = s[p]!;
    if (inString) {
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      if (c === "\\") {
        escapeNext = true;
        continue;
      }
      if (c === '"') inString = false;
      continue;
    }
    if (c === '"') {
      inString = true;
      continue;
    }
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) {
        return { json: s.slice(from, p + 1), rest: s.slice(p + 1) };
      }
    }
  }
  return null;
}

/**
 * When the ```json block has no closing ```: split object vs trailing long text, or
 * treat the whole tail as JSON only (no long content) if that fits.
 */
function parseCompositeWhenClosingFenceMissing<T>(
  afterOpen: string,
  jsonSchema: z.ZodSchema<T>,
): T & { content: string } {
  const trimmed = afterOpen.trimStart();
  if (!trimmed) {
    throw new Error("Unclosed ```json code block (empty after opening fence)");
  }
  const tryJsonOnly = (): T & { content: string } => {
    const jsonValue = jsonSchema.parse(betterJsonParse(trimmed)) as T;
    return { ...jsonValue, content: "" } as T & { content: string };
  };
  const split = splitLeadingJsonObject(trimmed);
  if (split) {
    try {
      const jsonValue = jsonSchema.parse(betterJsonParse(split.json)) as T;
      const longText = stripOneLeadingNewline(split.rest);
      return { ...jsonValue, content: longText } as T & { content: string };
    } catch (firstErr) {
      // If there is no long tail, a greedy repair on the whole string may help (JSON-only, fence truncated).
      if (split.rest.trim() === "") {
        try {
          return tryJsonOnly();
        } catch {
          // fall through to throw with first error
        }
      }
      const message =
        firstErr instanceof Error ? firstErr.message : String(firstErr);
      throw new Error(
        `Unclosed \`\`\`json code block: could not parse as composite output: ${message}`,
      );
    }
  }
  try {
    return tryJsonOnly();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Unclosed \`\`\`json code block: could not parse as composite output: ${message}`,
    );
  }
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
    return parseCompositeWhenClosingFenceMissing(afterOpen, jsonSchema);
  }
  const jsonRaw = afterOpen.slice(0, closeIdx).trim();
  const afterClose = afterOpen.slice(closeIdx + 3);
  const longText = stripOneLeadingNewline(afterClose);

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

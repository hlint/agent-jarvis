import type z from "zod";
import { DIVIDER } from "../defines/text";
import type { Tool } from "../defines/tool";

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

export function parseLlmResultWithDivider<T>(
  result: string,
  jsonSchema: z.ZodSchema<T>,
) {
  const parts = result.split(DIVIDER);
  if (parts.length < 2) {
    throw new Error(
      `Expected exactly 2 parts separated by ${DIVIDER}, but got ${parts.length} parts`,
    );
  }
  const [text, json] = parts;
  return [text!.trim(), jsonSchema.parse(betterJsonParse(json!))] as const;
}

export function parseLlmResultBeforeDivider(result: string) {
  const parts = result.split(DIVIDER);
  const [text] = parts;
  return text!.trim();
}

export function betterJsonParse(jsonStr: string) {
  const match = jsonStr.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON object found in string");
  return JSON.parse(match[0]);
}

export function getToolsInfo(tools: Tool[]) {
  return JSON.stringify(
    tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema.toJSONSchema(),
    })),
  );
}

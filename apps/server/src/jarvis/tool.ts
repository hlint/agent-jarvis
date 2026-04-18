import type { AgentTool } from "@repo/shared/agent/defines/tool";
import type z from "zod";
import attachmentTool from "./built-in-tools/attachement";
import { contextPruneTool } from "./built-in-tools/context-prune";
import { execTool } from "./built-in-tools/exec";
import { fileTools } from "./built-in-tools/file";
import imageGenerationTool from "./built-in-tools/image-generation";
import imageSearchTool from "./built-in-tools/image-search";
import multimodalSubagentTool from "./built-in-tools/multimodal-subagent";
import notifyTool from "./built-in-tools/notify";
import webExtractTool from "./built-in-tools/web-extract";
import webSearchSearxngTool from "./built-in-tools/web-search-searxng";
import webSearchTavilyTool from "./built-in-tools/web-search-tavily";
import type Jarvis from "./jarvis";

export const builtInTools = [
  attachmentTool,
  webSearchTavilyTool,
  webSearchSearxngTool,
  webExtractTool,
  imageSearchTool,
  imageGenerationTool,
  multimodalSubagentTool,
  notifyTool,
  execTool,
  contextPruneTool,
  ...fileTools,
];

export type JarvisTool<INPUT extends {}> = {
  name: string;
  description: string | ((jarvis: Jarvis) => string);
  inputSchema: z.ZodSchema<INPUT>;
  execute: (
    input: INPUT & { content?: string },
    jarvis: Jarvis,
  ) => Promise<any>;
  /**
   * When set, composite-encoded input is used: fenced json for short fields,
   * then one newline after the fence, then plain text (merged into `content`).
   * This string documents what that trailing segment means; prompts/parsers
   * use it with the schema.
   */
  inputContentDescription?: string;
};

export function defineJarvisTool<INPUT extends {}>(
  t: JarvisTool<INPUT>,
): JarvisTool<INPUT> {
  return t;
}

export function createAiTools(
  jarvisTools: JarvisTool<any>[],
  jarvis: Jarvis,
): AgentTool[] {
  return jarvisTools.map((jarvisTool) => ({
    name: jarvisTool.name,
    description:
      typeof jarvisTool.description === "function"
        ? jarvisTool.description(jarvis)
        : jarvisTool.description,
    inputSchema: jarvisTool.inputSchema,
    execute: async (input) => {
      return jarvisTool.execute(input, jarvis);
    },
    ...(jarvisTool.inputContentDescription
      ? { inputContentDescription: jarvisTool.inputContentDescription }
      : {}),
  }));
}

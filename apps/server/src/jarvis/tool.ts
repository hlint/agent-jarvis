import type { AgentTool } from "@repo/shared/agent/defines/tool";
import type z from "zod";
import attachmentTool from "./built-in-tools/attachement";
import { contextCompressTool } from "./built-in-tools/context-compress";
import { listCronTasksTool } from "./built-in-tools/cron";
import { execTool } from "./built-in-tools/exec";
import { fileTools } from "./built-in-tools/file";
import imageGenerationTool from "./built-in-tools/image-generation";
import imageSearchTool from "./built-in-tools/image-search";
import multimodalSubagentTool from "./built-in-tools/multimodal-subagent";
import notifyTool from "./built-in-tools/notify";
import webExtractTool from "./built-in-tools/web-extract";
import webSearchTool from "./built-in-tools/web-search";
import type Jarvis from "./jarvis";

export const builtInTools = [
  attachmentTool,
  webSearchTool,
  webExtractTool,
  imageSearchTool,
  imageGenerationTool,
  multimodalSubagentTool,
  notifyTool,
  execTool,
  listCronTasksTool,
  contextCompressTool,
  ...fileTools,
];

export type JarvisTool<INPUT extends {}> = {
  name: string;
  description: string;
  inputSchema: z.ZodSchema<INPUT>;
  execute: (input: INPUT, jarvis: Jarvis) => Promise<any>;
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
    description: jarvisTool.description,
    inputSchema: jarvisTool.inputSchema,
    execute: async (input) => {
      return jarvisTool.execute(input, jarvis);
    },
  }));
}

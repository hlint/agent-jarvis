import type { AgentTool } from "@repo/shared/agent/defines/tool";
import type z from "zod";
import { contextCompressTool } from "./built-in-tools/context-compress";
import { execTool } from "./built-in-tools/exec";
import { fileTools } from "./built-in-tools/file";
import { listCronTasksTool } from "./built-in-tools/cron";
import notifyTool from "./built-in-tools/notify";
import webExtractTool from "./built-in-tools/web-extract";
import webSearchTool from "./built-in-tools/web-search";
import type Jarvis from "./jarvis";

export const builtInTools = [
  webSearchTool,
  webExtractTool,
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

import type { AgentTool } from "@repo/shared/agent/defines/tool";
import type z from "zod";
import { contextCompressTool } from "./built-in-tools/context-compress";
import {
  listCronTasksTool,
  removeCronTaskTool,
  upsertCronTaskTool,
} from "./built-in-tools/cron";
import notifyTool from "./built-in-tools/notify";
import { recallSkillTool } from "./built-in-tools/recall-skill";
import updateMemoryTool from "./built-in-tools/update-memory";
import { upsertSkillTool } from "./built-in-tools/upsert-skill";
import weatherForecastTool from "./built-in-tools/weather";
import webExtractTool from "./built-in-tools/web-extract";
import webSearchTool from "./built-in-tools/web-search";
import { workspaceDeleteFileTool } from "./built-in-tools/workspace-delete-file";
import { workspaceGetInfoTool } from "./built-in-tools/workspace-get-info";
import { workspaceListDirTool } from "./built-in-tools/workspace-list-dir";
import { workspaceManageDeps } from "./built-in-tools/workspace-manage-deps";
import { workspaceReadFileTool } from "./built-in-tools/workspace-read-file";
import { workspaceRenameFileTool } from "./built-in-tools/workspace-rename-file";
import { workspaceRunScriptTool } from "./built-in-tools/workspace-run-script";
import { workspaceWriteFileTool } from "./built-in-tools/workspace-write-file";
import writeDiaryTool from "./built-in-tools/write-diary";
import type Jarvis from "./jarvis";

export const builtInTools = [
  weatherForecastTool,
  webSearchTool,
  webExtractTool,
  updateMemoryTool,
  writeDiaryTool,
  notifyTool,
  recallSkillTool,
  upsertSkillTool,
  upsertCronTaskTool,
  removeCronTaskTool,
  listCronTasksTool,
  workspaceReadFileTool,
  workspaceWriteFileTool,
  workspaceDeleteFileTool,
  workspaceRenameFileTool,
  workspaceListDirTool,
  workspaceRunScriptTool,
  workspaceManageDeps,
  workspaceGetInfoTool,
  contextCompressTool,
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

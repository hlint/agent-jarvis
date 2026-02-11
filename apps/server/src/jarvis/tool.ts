import type { ToolCallChatEvent } from "@repo/shared/defines/chat-event";
import { type FlexibleSchema, tool } from "ai";
import { omit } from "es-toolkit";
import {
  listCronTasksTool,
  removeCronTaskTool,
  upsertCronTaskTool,
} from "./built-in-tools/cron";
import notifyTool from "./built-in-tools/notify";
import requestConfirmationTool from "./built-in-tools/request-confirmation";
import { reviewSkillTool } from "./built-in-tools/review-skill";
import thinkTool from "./built-in-tools/think";
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
import { workspaceRunScriptTool } from "./built-in-tools/workspace-run-script";
import { workspaceWriteFileTool } from "./built-in-tools/workspace-write-file";
import type Jarvis from "./jarvis";

export const builtInTools = [
  thinkTool,
  weatherForecastTool,
  webSearchTool,
  webExtractTool,
  updateMemoryTool,
  notifyTool,
  requestConfirmationTool,
  reviewSkillTool,
  upsertSkillTool,
  upsertCronTaskTool,
  removeCronTaskTool,
  listCronTasksTool,
  workspaceReadFileTool,
  workspaceWriteFileTool,
  workspaceDeleteFileTool,
  workspaceListDirTool,
  workspaceRunScriptTool,
  workspaceManageDeps,
  workspaceGetInfoTool,
];

export type JarvisTool<INPUT extends { brief: string } = { brief: string }> = {
  name: string;
  description: string;
  inputSchema: FlexibleSchema<INPUT>;
  execute: (input: INPUT, jarvis: Jarvis) => Promise<any>;
};

export function defineJarvisTool<INPUT extends { brief: string }>(
  t: JarvisTool<INPUT>,
): JarvisTool<INPUT> {
  return t;
}

export function createAiTools(jarvisTools: JarvisTool<any>[], jarvis: Jarvis) {
  return Object.fromEntries(
    jarvisTools.map((jarvisTool) => [
      jarvisTool.name,
      tool({
        description: jarvisTool.description,
        inputSchema: jarvisTool.inputSchema,
        execute: async (input, { toolCallId }) => {
          let result = null;
          const toolCallChatEvent = jarvis.state
            .getChatEvents()
            .find((item): item is ToolCallChatEvent => item.id === toolCallId);
          if (!toolCallChatEvent) {
            throw new Error(`Tool call event not found: ${toolCallId}`);
          }
          toolCallChatEvent.brief = input.brief;
          toolCallChatEvent.toolName = jarvisTool.name;
          toolCallChatEvent.toolInput = omit(input, ["brief"]);
          toolCallChatEvent.toolOutput = null;
          toolCallChatEvent.pending = true;
          jarvis.state.notifyStateChanged();
          try {
            result = await jarvisTool.execute(input, jarvis);
          } catch (error) {
            result = `Something went wrong: ${error}`;
          }
          toolCallChatEvent.toolOutput = result;
          toolCallChatEvent.pending = false;
          toolCallChatEvent.time = Date.now();
          jarvis.state.notifyStateChanged();
          return result;
        },
      }),
    ]),
  );
}

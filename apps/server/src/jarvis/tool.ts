import type { ToolCallChatEvent } from "@repo/shared/defines/chat-event";
import { type FlexibleSchema, tool } from "ai";
import { omit } from "es-toolkit";
import { nanoid } from "nanoid";
import {
  listCronTasksTool,
  removeCronTaskTool,
  upsertCronTaskTool,
} from "./built-in-tools/cron";
import notifyTool from "./built-in-tools/notify";
import { reviewSkillTool } from "./built-in-tools/review-skill";
import thinkTool from "./built-in-tools/think";
import updateMemoryTool from "./built-in-tools/update-memory";
import { upsertSkillTool } from "./built-in-tools/upsert-skill";
import weatherForecastTool from "./built-in-tools/weather";
import webExtractTool from "./built-in-tools/web-extract";
import webSearchTool from "./built-in-tools/web-search";
import type Jarvis from "./jarvis";

export const builtInTools = [
  thinkTool,
  weatherForecastTool,
  webSearchTool,
  webExtractTool,
  updateMemoryTool,
  notifyTool,
  reviewSkillTool,
  upsertSkillTool,
  upsertCronTaskTool,
  removeCronTaskTool,
  listCronTasksTool,
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
        execute: async (input) => {
          let result = null;
          const toolCallChatEvent: ToolCallChatEvent = {
            id: nanoid(6),
            role: "tool-call",
            time: Date.now(),
            brief: input.brief,
            toolName: jarvisTool.name,
            toolInput: omit(input, ["brief"]),
            toolOutput: null,
            pending: true,
          };
          jarvis.state.addChatEvent(toolCallChatEvent);
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

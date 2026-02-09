import type { ToolCallChatEvent } from "@repo/shared/defines/chat-event";
import { type FlexibleSchema, tool } from "ai";
import { omit } from "es-toolkit";
import { nanoid } from "nanoid";
import type Jarvis from "./jarvis";

export type JarvisTool<INPUT extends { brief: string } = { brief: string }> = {
  name: string;
  description: string;
  inputSchema: FlexibleSchema<INPUT>;
  execute: (input: INPUT) => Promise<any>;
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
            const result = await jarvisTool.execute(input);
            toolCallChatEvent.toolOutput = result;
          } catch (error) {
            toolCallChatEvent.toolOutput = `Something went wrong: ${error}`;
          }
          toolCallChatEvent.pending = false;
          toolCallChatEvent.time = Date.now();
          jarvis.state.notifyStateChanged();
        },
      }),
    ]),
  );
}

import type { ChatEvent } from "@repo/shared/defines/chat-event";
import type { ModelMessage, ToolModelMessage } from "ai";
import { pick } from "es-toolkit";
import { contentBuilder } from "./utils";

export function chatEventsToModelMessages(events: ChatEvent[]): ModelMessage[] {
  return events
    .map((event) => {
      switch (event.role) {
        case "assistant":
          return {
            role: "assistant" as const,
            content: contentBuilder({
              time: event.time,
              text: event.content,
            }),
          };
        case "user":
          return {
            role: "user" as const,
            content: contentBuilder({
              time: event.time,
              text: event.content,
            }),
          };
        case "tool-call":
          return {
            role: "tool",
            content: [
              {
                type: "tool-result",
                toolName: "system-tool-call-tracking",
                toolCallId: event.id,
                output: {
                  type: "json",
                  value: {
                    toolName: event.toolName,
                    brief: event.brief,
                    time: event.time,
                    status: event.pending ? "pending" : "completed",
                    input: event.toolInput,
                    output: event.toolOutput,
                  },
                },
              },
            ],
          } satisfies ToolModelMessage;
        case "cron-task-trigger":
          return {
            role: "tool",
            content: [
              {
                type: "tool-result",
                toolName: "system-cron-task-trigger-notification",
                toolCallId: event.id,
                output: {
                  type: "json",
                  value: pick(event, [
                    "taskName",
                    "oneTimeTrigger",
                    "taskDescription",
                    "taskCronPattern",
                  ]),
                },
              },
            ],
          } satisfies ToolModelMessage;
        case "double-check":
          return {
            role: "tool",
            content: [
              {
                type: "tool-result",
                toolName: "system-tool-call-tracking",
                toolCallId: event.id,
                output: {
                  type: "text",
                  value:
                    "[System Event: Double Check] Please check the previous actions and decide whether to continue. If nothing more to do (completed all tasks, need user to confirm/fill in more information), call the 'do-nothing' tool.",
                },
              },
            ],
          } satisfies ToolModelMessage;
        default:
          return null;
      }
    })
    .filter(Boolean);
}

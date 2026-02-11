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
        case "request-confirmation":
          return {
            role: "tool",
            content: [
              {
                type: "tool-result",
                toolName: "system-user-confirmation",
                toolCallId: event.id,
                output: {
                  type: "json",
                  value: {
                    brief: event.brief,
                    status: event.status,
                    lastUpdated: event.time,
                    guidance:
                      event.status === "pending"
                        ? "Await explicit user confirmation. Do not proceed; call the 'do-nothing' tool until the user responds."
                        : event.status === "confirmed"
                          ? "User explicitly confirmed. You may proceed with the planned action."
                          : "User rejected the request. Do not continue with the proposed action; provide alternatives or ask for clarification.",
                  },
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

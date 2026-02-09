import type { ChatEvent } from "@repo/shared/defines/chat-event";
import type { ModelMessage, ToolModelMessage } from "ai";
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
        default:
          return null;
      }
    })
    .filter(Boolean);
}

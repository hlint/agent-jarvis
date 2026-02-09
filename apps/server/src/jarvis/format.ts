import type { ChatEvent } from "@repo/shared/defines/chat-event";
import type { ModelMessage } from "ai";
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
            role: "assistant" as const,
            content: contentBuilder({
              time: event.time,
              systemEventLabel: "Tool Call Request",
              text: [
                `Tool Name: ${event.toolName}`,
                `Brief: ${event.brief}`,
                `Status: ${event.pending ? "Pending" : "Completed"}`,
                `Tool Input: ${JSON.stringify(event.toolInput)}`,
                `Tool Output: ${JSON.stringify(event.toolOutput)}`,
              ].join("\n"),
            }),
          };
        default:
          return null;
      }
    })
    .filter(Boolean);
}

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
        case "tool-request":
          return {
            role: "assistant" as const,
            content: contentBuilder({
              time: event.time,
              systemEventLabel: "Tool Call Request",
              text: [
                `Tool Name: ${event.toolName}`,
                `Tool Call Reason: ${event.reason}`,
                `Pending: ${event.pending}`,
                `Tool Input: ${JSON.stringify(event.toolInput)}`,
              ].join("\n"),
            }),
          };
        case "tool-response":
          return {
            role: "assistant" as const,
            content: contentBuilder({
              time: event.time,
              systemEventLabel: "Tool Call Response",
              text: [
                `Tool Name: ${event.toolName}`,
                `Tool Call Request Id: ${event.toolCallId}`,
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

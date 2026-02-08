import type { ClientMessage } from "@repo/shared/defines";
import type { ModelMessage } from "ai";

export function toClientMessage(message: ModelMessage): ClientMessage | null {
  if (message.role !== "assistant" && message.role !== "user") {
    return null;
  }
  return {
    role: message.role,
    content:
      typeof message.content === "string"
        ? message.content
        : JSON.stringify(message.content),
  };
}

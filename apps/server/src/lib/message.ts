import type { ChatMessage } from "@repo/shared/defines/message";
import type { ModelMessage } from "ai";
import { cloneDeep, pick } from "es-toolkit";

export function chatMessagesToModelMessages(
  messages: ChatMessage[],
): ModelMessage[] {
  const output: ModelMessage[] = [];
  messages.forEach((m) => {
    const chatMessage: ChatMessage = cloneDeep(m);
    if (chatMessage.role === "user") {
      const metadata = pick(chatMessage, ["id", "createdTime", "attachments"]);
      const text = `<METADATA>${JSON.stringify(metadata)}</METADATA>${chatMessage.content}`;
      output.push({
        role: "user",
        content: text,
      });
    }
    if (chatMessage.role === "assistant") {
      const text = chatMessage.content;
      // const text = `<METADATA>${JSON.stringify(pick(chatMessage, ["id", "createdTime", "reasoning"]))}</METADATA>${chatMessage.content}`; // Disable metadata for now because it may cause issues with the model
      output.push({
        role: "assistant",
        content: [
          {
            type: "text",
            text,
          },
          ...chatMessage.toolCalls.map((t) => {
            return {
              type: "tool-call" as const,
              toolCallId: t.id,
              toolName: t.toolName,
              input: t.toolInput,
            };
          }),
        ],
      });

      if (chatMessage.toolCalls.length > 0) {
        output.push({
          role: "tool",
          content: chatMessage.toolCalls.map((t) => {
            return {
              type: "tool-result" as const,
              toolCallId: t.id,
              toolName: t.toolName,
              output: t.error
                ? {
                    type: "error-text" as const,
                    value: String(t.error),
                  }
                : {
                    type: "json" as const,
                    value: t.toolOutput,
                  },
            };
          }),
        });
      }
    }
  });
  return output;
}

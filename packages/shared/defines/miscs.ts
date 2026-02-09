import z from "zod";
import type { ChatEvent } from "./chat-event";

export const AgentConfigSchema = z.object({
  gemini_model: z.string(),
  gemini_api_key: z.string(),
});

export type AgentConfig = z.infer<typeof AgentConfigSchema>;

export type WsMessage = WsMessageChatEventsPatch;
export type WsMessageChatEventsPatch = {
  type: "chat-events-patch";
  fromId: string;
  toId: string;
  diff: any;
};

export type ChatState = {
  snapshotId: string;
  chatEvents: ChatEvent[];
};

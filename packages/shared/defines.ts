import z from "zod";

export const AgentConfigSchema = z.object({
  gemini_model: z.string(),
  gemini_api_key: z.string(),
});

export type AgentConfig = z.infer<typeof AgentConfigSchema>;

export type WebSocketMessageForClient =
  | { type: "message"; payload: ClientMessage }
  | {
      type: "reply-stream-start";
    }
  | { type: "reply-stream-delta"; payload: string }
  | { type: "thinking"; payload: string }
  | { type: "clear-messages" };

export type ClientMessage = {
  role: "assistant" | "user";
  content: string;
};

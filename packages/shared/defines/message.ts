import type { JSONValue } from "./miscs";

export type ChatMessage = UserMessage | AssistantMessage;

type BaseMessageMetadata = {
  id: string;
  createdAt: number;
  createdTime: string;
};

export type UserMessage = {
  role: "user";
  content: string;
  attachments?: string[];
} & BaseMessageMetadata;

export type AssistantMessage = {
  role: "assistant";
  content: string;
  status: "pending" | "completed" | "failed";
  reasoning: string;
  toolCalls: {
    id: string;
    toolName: string;
    status: "pending" | "completed" | "failed";
    toolInput: JSONValue;
    toolOutput: JSONValue;
    error?: unknown;
  }[];
} & BaseMessageMetadata;

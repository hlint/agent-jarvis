export type ChatEvent = AssistantChatEvent | UserChatEvent | ToolCallChatEvent;

export type AssistantChatEvent = {
  id: string;
  role: "assistant";
  time: number;
  content: string;
  pending: boolean;
};

export type UserChatEvent = {
  id: string;
  role: "user";
  time: number;
  content: string;
};

export type ToolCallChatEvent = {
  id: string;
  role: "tool-call";
  time: number;
  brief: string;
  toolName: string;
  toolInput: any;
  toolOutput: any;
  pending: boolean;
};

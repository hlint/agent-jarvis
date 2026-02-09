export type ChatEvent =
  | AssistantChatEvent
  | UserChatEvent
  | ToolRequestChatEvent
  | ToolResponseChatEvent;

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

export type ToolRequestChatEvent = {
  id: string;
  role: "tool-request";
  time: number;
  reason: string;
  toolName: string;
  toolInput: any;
  pending: boolean;
};

export type ToolResponseChatEvent = {
  id: string;
  role: "tool-response";
  time: number;
  toolName: string;
  toolCallId: string;
  toolOutput: any;
};

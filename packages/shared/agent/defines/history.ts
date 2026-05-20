export type HistoryEntry = {
  id: string;
  role:
    | "user"
    | "agent-thinking"
    | "agent-reply"
    | "attachment"
    | "html-view"
    | "agent-tool-call"
    | "system-event";
  status?: "pending" | "completed" | "failed";
  createdAt: number;
  createdTime: string;
  reasoning?: string;
  content?: string;
  error?: string;
  from?: "user" | "assistant" | "system";
  action?: any;
  inputTokens?: number;
  data?: any;
  brief?: string;
  title?: string;
  toolName?: string;
  toolInput?: any;
  toolOutput?: any;
};

export type DialogHistory = HistoryEntry[];

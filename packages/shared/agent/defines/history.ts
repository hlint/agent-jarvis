export type HistoryEntry = {
  id: string;
  role:
    | "user"
    | "agent-thinking"
    | "agent-reply"
    | "attachment"
    | "agent-tool-call"
    | "system-event";
  status?: "pending" | "completed" | "failed";
  createdAt: number;
  createdTime: string;
  content?: string;
  error?: string;
  from?: "user" | "assistant" | "system";
  channel?: string;
  action?: any;
  inputTokens?: number;
  data?: any;
  brief?: string;
  toolName?: string;
  toolInput?: any;
  toolOutput?: any;
};

export type DialogHistory = HistoryEntry[];

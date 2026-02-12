export type HistoryEntry = {
  id: string;
  role:
    | "user"
    | "agent-thinking"
    | "agent-reply"
    | "agent-tool-call"
    | "system-event";
  status?: "pending" | "completed" | "failed";
  createdTime: string;
  updatedTime?: string;
  content?: string;
  action?: any;
  data?: any;
  input?: any;
  output?: any;
};

export type DialogHistory = HistoryEntry[];

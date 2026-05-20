import type { DialogHistory } from "../agent/defines/history";

// WebSocket message body
export type WsMessage = WsMessageDialogHistoryPatch | JarvisChatStatusUpdate;

// Chat event patch
export type WsMessageDialogHistoryPatch = {
  type: "dialog-history-patch";
  fromId: string;
  toId: string;
  diff: any;
};

// Chat status
export type JarvisChatStatus = "running" | "idle" | "stopping";

// Chat status patch
export type JarvisChatStatusUpdate = {
  type: "chat-status-update";
  status: JarvisChatStatus;
};

export type JarvisChatState = {
  snapshotId: string;
  dialogHistory: DialogHistory;
  status: JarvisChatStatus;
};

export type HtmlViewEntry = {
  id: string;
  role: "html-view";
  from: "assistant";
  createdAt: number;
  createdTime: string;
  title?: string;
  content?: string;
};

export type AttachmentEntry = {
  id: string;
  role: "attachment";
  from: "user" | "assistant";
  createdAt: number;
  createdTime: string;
  data:
    | {
        type: "local-file" | "remote-url";
        originalName: string;
        fileType: string;
        fileSize: number;
        filePath: string;
      }
    | {
        type: "remote-url";
        url: string;
      };
};

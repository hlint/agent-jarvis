import type { DialogHistory } from "../agent/defines/history";

// WebSocket 消息体
export type WsMessage = WsMessageDialogHistoryPatch | JarvisChatStatusUpdate;

// 聊天事件补丁
export type WsMessageDialogHistoryPatch = {
  type: "dialog-history-patch";
  fromId: string;
  toId: string;
  diff: any;
};

// 聊天状态
export type JarvisChatStatus = "running" | "idle" | "stopping";

// 聊天状态补丁
export type JarvisChatStatusUpdate = {
  type: "chat-status-update";
  status: JarvisChatStatus;
};

export type JarvisChatState = {
  snapshotId: string;
  dialogHistory: DialogHistory;
  status: JarvisChatStatus;
};

export type AttachmentEntry = {
  id: string;
  role: "attachment";
  from: "user" | "assistant";
  channel: "web" | "tool-call" | "telegram";
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

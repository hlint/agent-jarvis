import type { DialogHistory } from "../agent/defines/history";

// WebSocket 消息体
export type WsMessage = WsMessageDialogHistoryPatch;

// 聊天事件补丁
export type WsMessageDialogHistoryPatch = {
  type: "dialog-history-patch";
  fromId: string;
  toId: string;
  diff: any;
};

export type JarvisChatState = {
  snapshotId: string;
  dialogHistory: DialogHistory;
};

export type AttachmentEntry = {
  id: string;
  role: "attachment";
  from: "user" | "assistant";
  channel: "web" | "tool-call" | "telegram";
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

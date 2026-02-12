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

export type JarvisState = {
  snapshotId: string;
  dialogHistory: DialogHistory;
};

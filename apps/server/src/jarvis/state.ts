import type { DialogHistory } from "@repo/shared/agent/defines/history";
import type { JarvisChatState } from "@repo/shared/defines/jarvis";
import { createDiff } from "@repo/shared/lib/state-sync";
import { cloneDeep, debounce, throttle } from "es-toolkit";
import fs from "fs-extra";
import { nanoid } from "nanoid";
import { PATH_CHAT_STATE } from "./defines";
import type Jarvis from "./jarvis";

export class JarvisStateManager {
  private jarvis: Jarvis;
  private chatState: JarvisChatState = {
    snapshotId: nanoid(6),
    dialogHistory: [],
    status: "idle",
  };
  private previousDialogHistory: DialogHistory = [];

  constructor(jarvis: Jarvis) {
    this.jarvis = jarvis;
  }

  init() {
    try {
      const chatState = fs.readJSONSync(PATH_CHAT_STATE) as JarvisChatState;
      this.setState(chatState);
      this.previousDialogHistory = cloneDeep(this.chatState.dialogHistory);
    } catch (_error) {
      fs.writeJSONSync(PATH_CHAT_STATE, this.getState(), { spaces: 2 });
    }
  }

  setState(state: Partial<JarvisChatState>) {
    this.chatState = {
      ...this.chatState,
      ...state,
    };
  }

  getState(): JarvisChatState {
    return this.chatState;
  }

  pushDiff = throttle(() => {
    this.syncTelegramsyncDialogHistory();
    this.syncWsDialogHistory();
    this.persist();
  }, 500);

  // Sync WebSocket state
  private syncWsDialogHistory() {
    const previousSnapshotId = this.chatState.snapshotId;
    const newSnapshotId = nanoid(6);
    this.chatState.snapshotId = newSnapshotId;
    const diff = createDiff(
      this.previousDialogHistory,
      this.chatState.dialogHistory,
    );
    this.previousDialogHistory = cloneDeep(this.chatState.dialogHistory);
    this.jarvis.channelWeb.pushWebSocketMessage({
      type: "dialog-history-patch",
      fromId: previousSnapshotId,
      toId: newSnapshotId,
      diff,
    });
  }

  // Sync Telegram state
  private syncTelegramsyncDialogHistory() {
    const newCompletedDialogHistory = this.getNewCompletedDialogHistory();
    newCompletedDialogHistory.forEach((t) => {
      this.jarvis.channelTelegram.pushTelegramMessage(t);
    });
  }

  // From before/after state, find newly completed chat messages (user and agent)
  private getNewCompletedDialogHistory() {
    const newCompletedDialogHistory: DialogHistory = [];
    for (const item of this.chatState.dialogHistory) {
      const previousItem = this.previousDialogHistory.find(
        (pItem) => pItem.id === item.id,
      );
      const isNewUserMessage = item.role === "user" && !previousItem;
      const isNewAgentMessage =
        item.role === "agent-reply" &&
        item.status !== "pending" &&
        (!previousItem || previousItem.status === "pending");
      const isNewAttachmentEntry = item.role === "attachment" && !previousItem;
      if (isNewUserMessage || isNewAgentMessage || isNewAttachmentEntry) {
        newCompletedDialogHistory.push(item);
      }
    }
    return newCompletedDialogHistory;
  }

  // Persist
  private persist = debounce(() => {
    fs.writeJSONSync(PATH_CHAT_STATE, this.getState(), { spaces: 2 });
  }, 1000);
}

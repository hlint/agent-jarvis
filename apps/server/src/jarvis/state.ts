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
    this.jarvis.webSocket.pushWebSocketMessage({
      type: "dialog-history-patch",
      fromId: previousSnapshotId,
      toId: newSnapshotId,
      diff,
    });
  }

  // Persist
  private persist = debounce(() => {
    fs.writeJSONSync(PATH_CHAT_STATE, this.getState(), { spaces: 2 });
  }, 1000);
}

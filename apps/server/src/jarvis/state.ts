import type {
  DialogHistory,
  HistoryEntry,
} from "@repo/shared/agent/defines/history";
import type { JarvisState } from "@repo/shared/defines/jarvis";
import { createDiff } from "@repo/shared/lib/state-sync";
import { cloneDeep, debounce } from "es-toolkit";
import fs from "fs-extra";
import { nanoid } from "nanoid";
import { PATH_CHAT_STATE } from "./defines";
import type Jarvis from "./jarvis";

export class JarvisStateManager {
  private jarvis: Jarvis;
  private snapshotId: string = nanoid(6);
  private dialogHistory: DialogHistory = [];
  private previousDialogHistory: DialogHistory = [];

  constructor(jarvis: Jarvis) {
    this.jarvis = jarvis;
  }

  init() {
    try {
      const chatState = fs.readJSONSync(PATH_CHAT_STATE) as JarvisState;
      this.setState(chatState);
      this.previousDialogHistory = cloneDeep(this.dialogHistory);
    } catch (_error) {
      fs.writeJSONSync(PATH_CHAT_STATE, this.getState(), { spaces: 2 });
    }
  }

  setState(state: JarvisState) {
    this.snapshotId = state.snapshotId;
    this.dialogHistory = state.dialogHistory;
  }

  getState(): JarvisState {
    return {
      snapshotId: this.snapshotId,
      dialogHistory: this.dialogHistory,
    };
  }

  notifyStateChanged() {
    const previousSnapshotId = this.snapshotId;
    const newSnapshotId = nanoid(6);
    this.snapshotId = newSnapshotId;
    const diff = createDiff(this.previousDialogHistory, this.dialogHistory);
    this.previousDialogHistory = cloneDeep(this.dialogHistory);
    this.jarvis.clientManager.pushWebSocketMessage({
      type: "dialog-history-patch",
      fromId: previousSnapshotId,
      toId: newSnapshotId,
      diff,
    });
    this.persist();
  }

  newHistoryEntry(historyEntry: HistoryEntry) {
    this.dialogHistory.push(historyEntry);
    this.notifyStateChanged();
  }

  // 持久化
  private persist = debounce(() => {
    fs.writeJSONSync(PATH_CHAT_STATE, this.getState(), { spaces: 2 });
  }, 1000);
}

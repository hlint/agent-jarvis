import type { DialogHistory } from "@repo/shared/agent/defines/history";
import type { WsMessageDialogHistoryPatch } from "@repo/shared/defines/jarvis";
import { applyDiff } from "@repo/shared/lib/state-sync";
import { debounce } from "es-toolkit";
import { toast } from "sonner";
import { create } from "zustand";
import { api } from "@/lib/api";

type State = {
  debugMode: boolean;
  handleScrollToBottom: () => void;
  snapshotId: string;
  dialogHistory: DialogHistory;
};

type Actions = {
  setDebugMode: (debugMode: boolean) => void;
  pullFullDialogState: () => void;
  applyDialogHistoryPatch: (
    wsMessageDialogHistoryPatch: WsMessageDialogHistoryPatch,
  ) => void;
  setHandleScrollToBottom: (handleScrollToBottom: () => void) => void;
};

const useJarvisStore = create<State & Actions>((set, get) => ({
  debugMode: false,
  handleScrollToBottom: () => {},
  snapshotId: "",
  dialogHistory: [],
  setDebugMode: (debugMode) => set({ debugMode }),
  pullFullDialogState: debounce(() => {
    api.jarvis["dialog-state"].get().then((response) => {
      if (response.data) {
        const snapshotIdChanged = response.data.snapshotId !== get().snapshotId;
        if (snapshotIdChanged) {
          get().handleScrollToBottom();
        }
        set({
          snapshotId: response.data.snapshotId,
          dialogHistory: response.data.dialogHistory,
        });
      } else {
        toast.error("Failed to pull chat state");
      }
    });
  }, 500),
  applyDialogHistoryPatch: ({ fromId, toId, diff }) => {
    if (get().snapshotId === fromId) {
      const snapshotIdChanged = toId !== get().snapshotId;
      if (snapshotIdChanged) {
        get().handleScrollToBottom();
      }
      set({
        snapshotId: toId,
        dialogHistory: applyDiff(get().dialogHistory, diff),
      });
    } else {
      get().pullFullDialogState();
    }
  },
  setHandleScrollToBottom: (handleScrollToBottom: () => void) => {
    set({ handleScrollToBottom });
  },
}));

export default useJarvisStore;

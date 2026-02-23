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
  entryHiddenMarks: Record<string, boolean>;
  isFirstPull: boolean;
  inputMode: "text" | "voice";
  isUploading: boolean;
  inputText: string;
};

type Actions = {
  setDebugMode: (debugMode: boolean) => void;
  pullFullDialogState: () => void;
  applyDialogHistoryPatch: (
    wsMessageDialogHistoryPatch: WsMessageDialogHistoryPatch,
  ) => void;
  setHandleScrollToBottom: (handleScrollToBottom: () => void) => void;
  setEntryHiddenMarks: () => void;
  setInputMode: (inputMode: "text" | "voice") => void;
  setIsUploading: (isUploading: boolean) => void;
  setInputText: (inputText: string) => void;
  sendMessage: () => void;
};

const useJarvisStore = create<State & Actions>((set, get) => ({
  debugMode: false,
  inputMode: "text",
  isUploading: false,
  inputText: "",
  setInputMode: (inputMode) => set({ inputMode }),
  handleScrollToBottom: () => {},
  snapshotId: "",
  isFirstPull: true,
  dialogHistory: [],
  entryHiddenMarks: {},
  setDebugMode: (debugMode) => set({ debugMode }),
  setIsUploading: (isUploading) => set({ isUploading }),
  setInputText: (inputText) => set({ inputText }),
  sendMessage: () => {
    if (get().inputText.trim() === "") return;
    api.jarvis["user-message"].post({ content: get().inputText });
    set({ inputText: "" });
  },
  pullFullDialogState: debounce(() => {
    api.jarvis["dialog-state"].get().then((response) => {
      if (response.data) {
        const snapshotIdChanged = response.data.snapshotId !== get().snapshotId;
        if (snapshotIdChanged) {
          setTimeout(() => {
            get().handleScrollToBottom();
          }, 100);
        }
        set({
          snapshotId: response.data.snapshotId,
          dialogHistory: response.data.dialogHistory,
        });
        get().setEntryHiddenMarks();
        set({
          isFirstPull: false,
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
      get().setEntryHiddenMarks();
    } else {
      get().pullFullDialogState();
    }
  },
  setHandleScrollToBottom: (handleScrollToBottom: () => void) => {
    set({ handleScrollToBottom });
  },
  setEntryHiddenMarks: () => {
    const { dialogHistory, isFirstPull } = get();
    for (const historyEntry of dialogHistory) {
      const isCompleted =
        historyEntry.role !== "agent-reply" &&
        historyEntry.role !== "attachment" &&
        historyEntry?.status === "completed";
      if (isCompleted) {
        const setMark = (hidden: boolean) => {
          set({
            entryHiddenMarks: {
              ...get().entryHiddenMarks,
              [historyEntry.id]: hidden,
            },
          });
        };
        if (isFirstPull) {
          setMark(true);
        } else if (get().entryHiddenMarks[historyEntry.id] === undefined) {
          setMark(false);
          setTimeout(() => {
            setMark(true);
          }, 100);
        }
      }
    }
  },
}));

export default useJarvisStore;

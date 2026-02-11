import type { ChatEvent } from "@repo/shared/defines/chat-event";
import type { WsMessageChatEventsPatch } from "@repo/shared/defines/miscs";
import { applyDiff } from "@repo/shared/lib/state-sync";
import { debounce } from "es-toolkit";
import { toast } from "sonner";
import { create } from "zustand";
import { api } from "@/lib/api";

type State = {
  handleScrollToBottom: () => void;
  snapshotId: string;
  chatEvents: ChatEvent[];
};

type Actions = {
  pullFullChatState: () => void;
  applyChatStatePatch: (
    wsMessageChatEventsPatch: WsMessageChatEventsPatch,
  ) => void;
  setHandleScrollToBottom: (handleScrollToBottom: () => void) => void;
};

const useJarvisStore = create<State & Actions>((set, get) => ({
  handleScrollToBottom: () => {},
  snapshotId: "",
  chatEvents: [],
  pullFullChatState: debounce(() => {
    api.jarvis["chat-state"].get().then((response) => {
      if (response.data) {
        const snapshotIdChanged = response.data.snapshotId !== get().snapshotId;
        if (snapshotIdChanged) {
          get().handleScrollToBottom();
        }
        set({
          snapshotId: response.data.snapshotId,
          chatEvents: response.data.chatEvents,
        });
      } else {
        toast.error("Failed to pull chat state");
      }
    });
  }, 500),
  applyChatStatePatch: ({ fromId, toId, diff }) => {
    if (get().snapshotId === fromId) {
      const snapshotIdChanged = toId !== get().snapshotId;
      if (snapshotIdChanged) {
        get().handleScrollToBottom();
      }
      set({ snapshotId: toId, chatEvents: applyDiff(get().chatEvents, diff) });
    } else {
      get().pullFullChatState();
    }
  },
  setHandleScrollToBottom: (handleScrollToBottom: () => void) => {
    set({ handleScrollToBottom });
  },
}));

export default useJarvisStore;

import type { Notification } from "@repo/shared/defines/notification";
import type { Session, SessionListItem } from "@repo/shared/defines/session";
import type { WsMessage } from "@repo/shared/defines/ws";
import { applyDiff } from "@repo/shared/lib/state-sync";
import { toast } from "sonner";
import { create } from "zustand";
import { computed } from "zustand-computed-state";
import { api } from "@/lib/api";
import {
  type AttachmentUploadItem,
  canSendUserMessage,
  getCompletedAttachmentPaths,
} from "../lib/attachment-types";
import {
  clearPersistedSession,
  getInitialSessionId,
  persistSession,
} from "../lib/session-persistence";
import { WHITEBOARD_HOME_PATH } from "../whiteboard/constants";

function diffTouchesWhiteboard(diff: { path?: string }[]) {
  return diff.some(
    (op) => op.path === "/whiteboardPath" || op.path === "/whiteboardRevision",
  );
}

// import { api } from "@/lib/api";

type State = {
  isConnected: boolean;
  inputMode: "text" | "voice";
  isMobileMode: boolean;
  mobileSidebarOpen: boolean;
  mobileWhiteboardOpen: boolean;
  desktopWhiteboardOpen: boolean;
  localWhiteboardPath: string;
  localWhiteboardRevision: number;
  debugMode: boolean;
  sessionList: SessionListItem[];
  notifications: Notification[];
  currentSessionId: string | null;
  currentSession: Session | null;
  inputText: string;
  sendScrollNonce: number;
  attachments: AttachmentUploadItem[];
  isVoiceServiceAvailable: boolean;
};

type Actions = {
  setIsConnected: (isConnected: boolean) => void;
  setInputMode: (inputMode: "text" | "voice") => void;
  setIsMobileMode: (isMobileMode: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setMobileWhiteboardOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  toggleMobileWhiteboard: () => void;
  setDesktopWhiteboardOpen: (open: boolean) => void;
  toggleDesktopWhiteboard: () => void;
  openWhiteboardPanel: () => void;
  navigateWhiteboard: (path: string) => Promise<void>;
  setDebugMode: (debugMode: boolean) => void;
  setInputText: (inputText: string) => void;
  setCurrentSessionId: (currentSessionId: string) => void;
  setCurrentSession: (currentSession: Session) => void;
  setSessionList: (sessionList: SessionListItem[]) => void;
  setNotifications: (notifications: Notification[]) => void;
  deleteNotification: (id: string) => Promise<void>;
  switchSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  deleteMessagesFrom: (messageId: string) => Promise<void>;
  abortSession: () => Promise<void>;
  startNewConversation: () => void;
  pullState: () => Promise<void>;
  sendUserMessage: () => Promise<void>;
  handleWsMessage: (message: WsMessage) => void;
  patchAttachment: (id: string, patch: Partial<AttachmentUploadItem>) => void;
};

const useJarvisStore = create<State & Actions>(
  computed((set, get) => ({
    isConnected: false,
    setIsConnected: (isConnected) => set({ isConnected }),
    inputMode: "text",
    setInputMode: (inputMode) => set({ inputMode }),
    isMobileMode: false,
    setIsMobileMode: (isMobileMode) =>
      set({
        isMobileMode,
        ...(!isMobileMode && {
          mobileSidebarOpen: false,
          mobileWhiteboardOpen: false,
        }),
      }),
    mobileSidebarOpen: false,
    mobileWhiteboardOpen: false,
    desktopWhiteboardOpen: false,
    setDesktopWhiteboardOpen: (open) => set({ desktopWhiteboardOpen: open }),
    toggleDesktopWhiteboard: () =>
      set((state) => ({ desktopWhiteboardOpen: !state.desktopWhiteboardOpen })),
    openWhiteboardPanel: () => {
      if (get().isMobileMode) {
        get().setMobileWhiteboardOpen(true);
      } else {
        set({ desktopWhiteboardOpen: true });
      }
    },
    localWhiteboardPath: WHITEBOARD_HOME_PATH,
    localWhiteboardRevision: 0,
    navigateWhiteboard: async (path) => {
      const trimmed = path.trim();
      if (!trimmed) return;

      const sessionId = get().currentSessionId;
      if (!sessionId) {
        set((state) => ({
          localWhiteboardPath: trimmed,
          localWhiteboardRevision: state.localWhiteboardRevision + 1,
        }));
        return;
      }

      const { data, error } = await api.jarvis["whiteboard-path"].post({
        sessionId,
        path: trimmed,
      });

      if (error || !data?.success) {
        toast.error(data?.error ?? "Failed to update whiteboard path");
      }
    },
    setMobileSidebarOpen: (open) =>
      set({
        mobileSidebarOpen: open,
        ...(open && { mobileWhiteboardOpen: false }),
      }),
    setMobileWhiteboardOpen: (open) =>
      set({
        mobileWhiteboardOpen: open,
        ...(open && { mobileSidebarOpen: false }),
      }),
    toggleMobileSidebar: () => {
      const open = get().mobileSidebarOpen;
      set({
        mobileSidebarOpen: !open,
        ...(!open && { mobileWhiteboardOpen: false }),
      });
    },
    toggleMobileWhiteboard: () => {
      const open = get().mobileWhiteboardOpen;
      set({
        mobileWhiteboardOpen: !open,
        ...(!open && { mobileSidebarOpen: false }),
      });
    },
    debugMode: false,
    setDebugMode: (debugMode) => set({ debugMode }),
    inputText: "",
    sendScrollNonce: 0,
    attachments: [],
    isVoiceServiceAvailable: false,
    setInputText: (inputText) => set({ inputText }),
    patchAttachment: (id, patch) =>
      set((state) => ({
        attachments: state.attachments.map((a) =>
          a.id === id ? { ...a, ...patch } : a,
        ),
      })),
    sessionList: [],
    setSessionList: (sessionList) => set({ sessionList }),
    notifications: [],
    setNotifications: (notifications) => set({ notifications }),
    deleteNotification: async (id) => {
      const { data, status } = await api.jarvis.notification.delete({ id });
      if (status === 404) {
        toast.error("Notification not found");
        return;
      }
      if (!data?.success) {
        toast.error(data?.error ?? "Failed to delete notification");
      }
    },
    switchSession: async (sessionId) => {
      set({ currentSessionId: sessionId });
      persistSession(sessionId);
      await api.jarvis.session
        .get({ query: { sessionId } })
        .then(({ data }) => {
          if (data) {
            set({
              currentSession: data,
              mobileSidebarOpen: false,
              mobileWhiteboardOpen: false,
              desktopWhiteboardOpen: false,
            });
            return;
          }

          clearPersistedSession();
          set({
            currentSessionId: null,
            currentSession: null,
          });
        });
    },
    deleteSession: async (sessionId) => {
      const session = get().sessionList.find((item) => item.id === sessionId);
      if (session?.status !== "idle") {
        toast.error("Cannot delete while the conversation is running");
        return;
      }

      const { data, status } = await api.jarvis.session.delete({ sessionId });
      if (status === 409) {
        toast.error("Cannot delete while the conversation is running");
        return;
      }
      if (!data?.success) {
        toast.error(data?.error ?? "Failed to delete conversation");
        return;
      }

      if (get().currentSessionId === sessionId) {
        get().startNewConversation();
      }
    },
    deleteMessagesFrom: async (messageId) => {
      const sessionId = get().currentSessionId;
      if (!sessionId) return;

      const session =
        get().currentSession ??
        get().sessionList.find((item) => item.id === sessionId);
      if (session?.status !== "idle") {
        toast.error("Cannot delete while the conversation is running");
        return;
      }

      const { data, status } = await api.jarvis.messages.delete({
        sessionId,
        messageId,
      });
      if (status === 409) {
        toast.error("Cannot delete while the conversation is running");
        return;
      }
      if (!data?.success) {
        toast.error(data?.error ?? "Failed to delete messages");
      }
    },
    abortSession: async () => {
      const sessionId = get().currentSessionId;
      if (!sessionId) return;

      const { data, status } = await api.jarvis.abort.post({ sessionId });
      if (status === 409) {
        toast.error("Session is not running");
        return;
      }
      if (!data?.success) {
        toast.error(data?.error ?? "Failed to abort");
      }
    },
    startNewConversation: () => {
      clearPersistedSession();
      set({
        currentSessionId: null,
        currentSession: null,
        inputText: "",
        mobileSidebarOpen: false,
        mobileWhiteboardOpen: false,
        desktopWhiteboardOpen: false,
      });
    },
    currentSessionId: getInitialSessionId(),
    setCurrentSessionId: (currentSessionId) => set({ currentSessionId }),
    currentSession: null,
    setCurrentSession: (currentSession) => set({ currentSession }),
    pullState: async () => {
      const [sessionListRes, notificationListRes, voiceServiceRes] =
        await Promise.all([
          api.jarvis["session-list"].get(),
          api.jarvis["notification-list"].get(),
          api.jarvis["voice-service"].get(),
        ]);
      if (sessionListRes.data) {
        set({ sessionList: sessionListRes.data });
      }
      if (notificationListRes.data) {
        set({ notifications: notificationListRes.data });
      }
      if (voiceServiceRes.data) {
        set({ isVoiceServiceAvailable: voiceServiceRes.data.available });
      }
      const currentSessionId = get().currentSessionId;
      if (currentSessionId) {
        await api.jarvis.session
          .get({ query: { sessionId: currentSessionId } })
          .then(({ data }) => {
            if (data) {
              set({ currentSession: data });
              persistSession(currentSessionId);
              return;
            }

            clearPersistedSession();
            set({ currentSessionId: null, currentSession: null });
          });
      }
    },
    sendUserMessage: async () => {
      const state = get();
      if (!canSendUserMessage(state)) return;

      const content = state.inputText;
      const attachments = getCompletedAttachmentPaths(state.attachments);

      set((s) => ({ sendScrollNonce: s.sendScrollNonce + 1 }));

      if (!get().currentSession) {
        const sessionName =
          content.trim().slice(0, 100) ||
          state.attachments
            .find((a) => a.status === "done")
            ?.originalName.slice(0, 100) ||
          "New conversation";
        await api.jarvis.session
          .post({ name: sessionName })
          .then(({ data }) => {
            if (data?.id) {
              persistSession(data.id);
              set({ currentSession: data, currentSessionId: data.id });
            }
          });
      }
      const sessionId = get().currentSession?.id ?? "";
      if (!sessionId) return;

      await api.jarvis["user-message"]
        .post({
          content,
          sessionId,
          ...(attachments.length > 0 ? { attachments } : {}),
        })
        .then(() => {
          persistSession(sessionId);
          set({ inputText: "", attachments: [] });
        });
    },
    handleWsMessage: (message) => {
      switch (message.type) {
        case "session-list-update": {
          const sessionList = message.data;
          const currentSessionId = get().currentSessionId;
          if (
            currentSessionId &&
            !sessionList.some((item) => item.id === currentSessionId)
          ) {
            get().startNewConversation();
          }
          set({ sessionList });
          break;
        }
        case "notification-list-update": {
          set({ notifications: message.data });
          break;
        }
        case "session-state-patch": {
          const { sessionId, fromSnapshotId, diff } = message.data;
          if (sessionId !== get().currentSessionId) break;
          persistSession(sessionId);
          const currentSession = get().currentSession;
          if (currentSession?.snapshotId === fromSnapshotId) {
            const newSession = applyDiff(currentSession, diff);
            set({
              currentSession: newSession,
              ...(diffTouchesWhiteboard(diff) && !get().isMobileMode
                ? { desktopWhiteboardOpen: true }
                : {}),
            });
          } else {
            get().switchSession(sessionId);
          }
          break;
        }
        case "layout-open-panel": {
          const { panel } = message.data;
          if (panel === "sidebar") {
            if (get().isMobileMode) {
              get().setMobileSidebarOpen(true);
            }
          } else {
            get().openWhiteboardPanel();
          }
          break;
        }
      }
    },
  })),
);

export default useJarvisStore;

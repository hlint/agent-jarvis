import type { Operation } from "fast-json-patch";
import type { Notification } from "./notification";
import type { SessionListItem } from "./session";

export type WsMessage =
  | {
      type: "session-list-update";
      data: SessionListItem[];
    }
  | {
      type: "notification-list-update";
      data: Notification[];
    }
  | {
      type: "session-state-patch";
      data: {
        sessionId: string;
        fromSnapshotId: string;
        toSnapshotId: string;
        diff: Operation[];
      };
    }
  | {
      type: "layout-open-panel";
      data: {
        panel: "sidebar" | "whiteboard";
      };
    };

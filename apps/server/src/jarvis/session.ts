import { join } from "node:path";
import { DEFAULT_WHITEBOARD_PATH } from "@repo/shared/defines/constant";
import type {
  Session,
  SessionListItem,
  SessionType,
} from "@repo/shared/defines/session";
import { isPublicSession } from "@repo/shared/defines/session";
import {
  normalizeSessionState,
  pushRecentWhiteboardPath,
  truncateSessionFromMessage,
} from "@repo/shared/lib/session";
import { createDiff } from "@repo/shared/lib/state-sync";
import { shortId } from "@repo/shared/lib/utils";
import { cloneDeep, debounce, pick, throttle } from "es-toolkit";
import fs from "fs-extra";
import { resolveRuntimePath, toDisplayPath } from "../lib/runtime-path";
import type Jarvis from ".";
import { DIR_RECYCLE_BIN, DIR_SESSIONS } from "./defines";

const DELAY_MS = 500;
const MAX_SESSION_NAME_LENGTH = 100;

export interface CreateSessionOptions {
  type?: SessionType;
  parentSessionId?: string;
}

export default class JarvisSession {
  private jarvis: Jarvis;
  constructor(jarvis: Jarvis) {
    this.jarvis = jarvis;
  }
  private sessionCtxs: Map<
    string,
    {
      session: Session;
      prevSessionState: Session;
      saveDebouncer: ReturnType<typeof debounce>;
      sessionSyncerThrottler: ReturnType<typeof throttle>;
    }
  > = new Map();
  init() {
    fs.ensureDirSync(DIR_SESSIONS);
    this.loadSessions();
  }

  private loadSessions() {
    fs.readdirSync(DIR_SESSIONS).forEach((sessionId) => {
      const sessionPath = join(DIR_SESSIONS, sessionId, `state.json`);
      if (!fs.existsSync(sessionPath)) {
        console.warn(`Session ${sessionId} state file not found, skipping`);
        return;
      }
      const sessionState = normalizeSessionState(fs.readJSONSync(sessionPath));
      this.sessionCtxs.set(sessionId, {
        session: sessionState,
        prevSessionState: cloneDeep(sessionState),
        saveDebouncer: this.createSaveDebouncer(sessionId),
        sessionSyncerThrottler: this.createSessionSyncerThrottler(sessionId),
      });
      if (sessionState.status !== "idle") {
        console.warn(`Session ${sessionId} was processing, setting to false`);
        sessionState.status = "idle";
        this.sessionChanged(sessionId);
      }
    });
  }

  getSessionList(): SessionListItem[] {
    return Array.from(this.sessionCtxs.values())
      .map((a) => a.session)
      .filter(isPublicSession)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((session) =>
        pick(session, [
          "id",
          "name",
          "type",
          "createdAt",
          "updatedAt",
          "status",
          "whiteboardPath",
          "whiteboardRevision",
          "destroyedAt",
          "parentSessionId",
        ]),
      );
  }

  getSession(sessionId: string) {
    const sessionCtx = this.sessionCtxs.get(sessionId);
    if (!sessionCtx) {
      console.warn(`Session ${sessionId} not found`);
      return null;
    }
    return sessionCtx.session;
  }

  createSession(name = "New Session", options: CreateSessionOptions = {}) {
    const type = options.type ?? "basic";
    const sessionState: Session = {
      id: shortId(),
      name,
      type,
      snapshotId: shortId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: "idle",
      rounds: [],
      whiteboardPath: DEFAULT_WHITEBOARD_PATH,
      whiteboardRevision: 0,
      recentWhiteboardPaths: [DEFAULT_WHITEBOARD_PATH],
      ...(options.parentSessionId
        ? { parentSessionId: options.parentSessionId }
        : {}),
    };
    this.sessionCtxs.set(sessionState.id, {
      session: sessionState,
      prevSessionState: cloneDeep(sessionState),
      saveDebouncer: this.createSaveDebouncer(sessionState.id),
      sessionSyncerThrottler: this.createSessionSyncerThrottler(
        sessionState.id,
      ),
    });
    fs.mkdirSync(join(DIR_SESSIONS, sessionState.id), { recursive: true });
    if (isPublicSession(sessionState)) {
      this.sessionListUpdated();
    }
    return sessionState;
  }

  private createSaveDebouncer(sessionId: string) {
    return debounce(() => {
      const sessionState = this.sessionCtxs.get(sessionId);
      if (!sessionState) {
        console.warn(`Session ${sessionId} not found`);
        return;
      }
      fs.writeJSON(
        join(DIR_SESSIONS, sessionId, `state.json`),
        sessionState.session,
        { spaces: 2 },
      );
    }, DELAY_MS);
  }

  private createSessionSyncerThrottler(sessionId: string) {
    return throttle(
      () => {
        const sessionCtx = this.sessionCtxs.get(sessionId);
        if (!sessionCtx) {
          console.warn(`Session ${sessionId} not found`);
          return;
        }
        if (!isPublicSession(sessionCtx.session)) {
          return;
        }
        const prevSessionState = sessionCtx.prevSessionState;
        sessionCtx.session.snapshotId = shortId();
        sessionCtx.prevSessionState = cloneDeep(sessionCtx.session);
        const newSessionState = sessionCtx.session;
        const diff = createDiff(prevSessionState, newSessionState);
        this.jarvis.ws.pushWsMessage({
          type: "session-state-patch",
          data: {
            sessionId,
            fromSnapshotId: prevSessionState.snapshotId,
            toSnapshotId: newSessionState.snapshotId,
            diff,
          },
        });
      },
      DELAY_MS,
      { edges: ["leading", "trailing"] },
    );
  }

  sessionChanged(sessionId: string) {
    const sessionCtx = this.sessionCtxs.get(sessionId);
    if (!sessionCtx) {
      console.warn(`Session ${sessionId} not found`);
      return;
    }
    sessionCtx.session.updatedAt = Date.now();
    sessionCtx.saveDebouncer();
    if (isPublicSession(sessionCtx.session)) {
      sessionCtx.sessionSyncerThrottler();
    }
  }

  sessionListUpdated() {
    this.jarvis.ws.pushWsMessage({
      type: "session-list-update",
      data: this.getSessionList(),
    });
  }

  setWhiteboardPath(
    sessionId: string,
    path: string,
    options?: { recordRecent?: boolean },
  ) {
    const sessionCtx = this.sessionCtxs.get(sessionId);
    if (!sessionCtx) {
      return { success: false, error: `Session ${sessionId} not found` };
    }

    const trimmed = path.trim();
    if (!trimmed) {
      return { success: false, error: "Whiteboard path cannot be empty" };
    }

    let displayPath: string;
    try {
      displayPath = toDisplayPath(resolveRuntimePath(trimmed));
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Invalid file path",
      };
    }

    const previousPath = sessionCtx.session.whiteboardPath;
    const refreshed = previousPath === displayPath;

    sessionCtx.session.whiteboardPath = displayPath;
    sessionCtx.session.whiteboardRevision += 1;
    if (options?.recordRecent && !refreshed) {
      sessionCtx.session.recentWhiteboardPaths = pushRecentWhiteboardPath(
        sessionCtx.session.recentWhiteboardPaths,
        displayPath,
      );
    }
    this.sessionChanged(sessionId);

    return {
      success: true,
      path: displayPath,
      revision: sessionCtx.session.whiteboardRevision,
      refreshed,
      ...(refreshed ? {} : { previousPath }),
    };
  }

  renameSession(sessionId: string, name: string) {
    const sessionCtx = this.sessionCtxs.get(sessionId);
    if (!sessionCtx) {
      return { success: false, error: `Session ${sessionId} not found` };
    }

    const trimmed = name.trim();
    if (!trimmed) {
      return { success: false, error: "Session name cannot be empty" };
    }
    if (trimmed.length > MAX_SESSION_NAME_LENGTH) {
      return {
        success: false,
        error: `Session name is too long (max ${MAX_SESSION_NAME_LENGTH} characters)`,
      };
    }

    const previousName = sessionCtx.session.name;
    if (previousName === trimmed) {
      return { success: true, name: trimmed, unchanged: true as const };
    }

    sessionCtx.session.name = trimmed;
    this.sessionChanged(sessionId);
    if (isPublicSession(sessionCtx.session)) {
      this.sessionListUpdated();
    }
    return { success: true, name: trimmed, previousName };
  }

  deleteSession(sessionId: string) {
    const sessionCtx = this.sessionCtxs.get(sessionId);
    if (!sessionCtx) {
      return {
        success: false,
        error: `Session ${sessionId} not found`,
        code: "not_found" as const,
      };
    }

    if (sessionCtx.session.status !== "idle") {
      return {
        success: false,
        error: `Session ${sessionId} is running`,
        code: "session_running" as const,
      };
    }

    sessionCtx.saveDebouncer.cancel();
    sessionCtx.sessionSyncerThrottler.cancel();

    sessionCtx.session.destroyedAt = Date.now();
    fs.writeJSONSync(
      join(DIR_SESSIONS, sessionId, "state.json"),
      sessionCtx.session,
      { spaces: 2 },
    );

    const sessionDir = join(DIR_SESSIONS, sessionId);
    if (fs.existsSync(sessionDir)) {
      fs.ensureDirSync(DIR_RECYCLE_BIN);
      let destDir = join(DIR_RECYCLE_BIN, sessionId);
      if (fs.existsSync(destDir)) {
        destDir = join(DIR_RECYCLE_BIN, `${sessionId}-${Date.now()}`);
      }
      fs.moveSync(sessionDir, destDir);
    }

    this.sessionCtxs.delete(sessionId);
    if (isPublicSession(sessionCtx.session)) {
      this.sessionListUpdated();
    }
    return { success: true };
  }

  deleteMessagesFrom(sessionId: string, messageId: string) {
    const sessionCtx = this.sessionCtxs.get(sessionId);
    if (!sessionCtx) {
      return {
        success: false,
        error: `Session ${sessionId} not found`,
        code: "not_found" as const,
      };
    }

    if (sessionCtx.session.status !== "idle") {
      return {
        success: false,
        error: `Session ${sessionId} is running`,
        code: "session_running" as const,
      };
    }

    const truncated = truncateSessionFromMessage(sessionCtx.session, messageId);
    if (!truncated) {
      return {
        success: false,
        error: `Message ${messageId} not found`,
        code: "message_not_found" as const,
      };
    }

    const messagesPath = join(DIR_SESSIONS, sessionId, "messages.json");
    if (fs.existsSync(messagesPath)) {
      fs.removeSync(messagesPath);
    }

    this.sessionChanged(sessionId);
    return { success: true };
  }
}

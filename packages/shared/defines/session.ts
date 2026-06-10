import type { LanguageModelUsage } from "ai";
import type { ChatMessage } from "./message";
import type { SessionPlan } from "./plan";

/** One user input through agent loop completion. */
export interface SessionRound {
  id: string;
  createdAt: number;
  messages: ChatMessage[];
}

export type SessionType = "basic" | "subagent-tool" | "subagent-cron";

export interface Session {
  id: string;
  name: string;
  type: SessionType;
  snapshotId: string;
  createdAt: number;
  updatedAt: number;
  status: "running" | "idle" | "stopping";
  rounds: SessionRound[];
  /** Runtime-relative HTML path shown in the whiteboard iframe. */
  whiteboardPath: string;
  /** Incremented on every whiteboard navigation or refresh (including same path). */
  whiteboardRevision: number;
  /** Agent-navigated whiteboard paths, most recent first. Always includes home.html. */
  recentWhiteboardPaths: string[];
  lastUsage?: LanguageModelUsage & { tokensSavedByHeadroom?: number };
  /** Per-turn task board; cleared when a new user message starts. */
  plan?: SessionPlan;
  /** Set when the session is deleted; persisted in recycle bin for audit. */
  destroyedAt?: number;
  /** Parent session when this session was spawned (subagent audit). */
  parentSessionId?: string;
}

export type SessionListItem = Omit<
  Session,
  "rounds" | "snapshotId" | "recentWhiteboardPaths"
>;

export interface RunResult {
  success: boolean;
  error?: string;
  output?: string;
}

export interface SubagentRunInput {
  sessionName: string;
  instruction: string;
  parentSessionId?: string;
  /** Session payload detail: 0=strip tool I/O, 1=strip tool output, 2=full. Default 0. */
  sessionDetail?: SubagentSessionDetail;
}

/** Subagent API session payload detail level. */
export type SubagentSessionDetail = 0 | 1 | 2;

export interface SubagentRunResult extends RunResult {
  session: Session;
}

export function isPublicSession(session: Session): boolean {
  return session.type === "basic";
}

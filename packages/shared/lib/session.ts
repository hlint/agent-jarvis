import { DEFAULT_WHITEBOARD_PATH } from "../defines/constant";
import type { AssistantMessage, ChatMessage } from "../defines/message";
import type {
  Session,
  SessionRound,
  SubagentSessionDetail,
} from "../defines/session";
import { shortId } from "./utils";

export const MAX_RECENT_WHITEBOARD_PATHS = 20;

export function normalizeRecentWhiteboardPaths(paths?: string[]): string[] {
  const home = DEFAULT_WHITEBOARD_PATH;
  const seen = new Set<string>();
  const result: string[] = [];
  for (const p of [home, ...(paths ?? [])]) {
    const trimmed = p.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result.slice(0, MAX_RECENT_WHITEBOARD_PATHS);
}

export function pushRecentWhiteboardPath(
  paths: string[],
  path: string,
): string[] {
  const trimmed = path.trim();
  if (!trimmed) return normalizeRecentWhiteboardPaths(paths);
  const without = (paths ?? []).filter((p) => p !== trimmed);
  return normalizeRecentWhiteboardPaths([trimmed, ...without]);
}

export function flattenSessionRounds(rounds: SessionRound[]): ChatMessage[] {
  return rounds.flatMap((round) => round.messages);
}

export function getCurrentRound(session: Session): SessionRound | undefined {
  return session.rounds[session.rounds.length - 1];
}

export function truncateSessionFromMessage(
  session: Session,
  messageId: string,
): boolean {
  let found = false;
  const newRounds: SessionRound[] = [];

  for (const round of session.rounds) {
    if (found) {
      break;
    }

    const messageIndex = round.messages.findIndex(
      (message) => message.id === messageId,
    );
    if (messageIndex === -1) {
      newRounds.push(round);
      continue;
    }

    found = true;
    const keptMessages = round.messages.slice(0, messageIndex);
    if (keptMessages.length > 0) {
      newRounds.push({ ...round, messages: keptMessages });
    }
  }

  if (!found) {
    return false;
  }

  session.rounds = newRounds;
  return true;
}

export function migrateMessagesToRounds(
  messages: ChatMessage[],
): SessionRound[] {
  const rounds: SessionRound[] = [];
  let current: SessionRound | null = null;

  for (const message of messages) {
    if (message.role === "user") {
      current = {
        id: message.id,
        createdAt: message.createdAt,
        messages: [message],
      };
      rounds.push(current);
      continue;
    }

    if (current) {
      current.messages.push(message);
      continue;
    }

    current = {
      id: shortId(),
      createdAt: message.createdAt,
      messages: [message],
    };
    rounds.push(current);
  }

  return rounds;
}

type LegacySessionState = Session & { messages?: ChatMessage[] };

export function getAssistantOutput(session: Session): string {
  const round = getCurrentRound(session);
  if (!round) return "";

  const assistants = round.messages.filter(
    (message): message is AssistantMessage => message.role === "assistant",
  );

  for (let i = assistants.length - 1; i >= 0; i--) {
    const message = assistants[i]!;
    if (
      (message.toolCalls?.length ?? 0) === 0 &&
      message.content.trim().length > 0
    ) {
      return message.content;
    }
  }

  return assistants
    .map((message) => message.content)
    .filter((content) => content.trim().length > 0)
    .join("\n");
}

export function applySubagentSessionDetail(
  session: Session,
  detail: SubagentSessionDetail = 0,
): Session {
  if (detail === 2) {
    return session;
  }

  for (const round of session.rounds) {
    for (const message of round.messages) {
      if (message.role !== "assistant") continue;
      for (const toolCall of message.toolCalls) {
        if (detail <= 1) {
          toolCall.toolOutput = null;
        }
        if (detail === 0) {
          toolCall.toolInput = null;
        }
      }
    }
  }

  return session;
}

function withSessionDefaults(session: Session): Session {
  return {
    ...session,
    type: session.type ?? "basic",
    whiteboardPath: session.whiteboardPath ?? DEFAULT_WHITEBOARD_PATH,
    whiteboardRevision: session.whiteboardRevision ?? 0,
    recentWhiteboardPaths: normalizeRecentWhiteboardPaths(
      session.recentWhiteboardPaths,
    ),
  };
}

export function normalizeSessionState(raw: LegacySessionState): Session {
  if (Array.isArray(raw.rounds)) {
    const { messages: _legacy, ...session } = raw;
    return withSessionDefaults(session);
  }

  const { messages, ...rest } = raw;
  return withSessionDefaults({
    ...rest,
    rounds: messages?.length ? migrateMessagesToRounds(messages) : [],
  });
}

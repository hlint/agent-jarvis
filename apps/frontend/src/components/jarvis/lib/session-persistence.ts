const SESSION_STORAGE_KEY = "jarvis:last-session";
const SESSION_RESTORE_TTL_MS = 4 * 60 * 60 * 1000;

type StoredSession = {
  sessionId: string;
  lastActiveAt: number;
};

function isStoredSession(value: unknown): value is StoredSession {
  return (
    typeof value === "object" &&
    value !== null &&
    "sessionId" in value &&
    "lastActiveAt" in value &&
    typeof value.sessionId === "string" &&
    typeof value.lastActiveAt === "number"
  );
}

export function readPersistedSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isStoredSession(parsed)) {
      clearPersistedSession();
      return null;
    }

    if (Date.now() - parsed.lastActiveAt > SESSION_RESTORE_TTL_MS) {
      clearPersistedSession();
      return null;
    }

    return parsed;
  } catch {
    clearPersistedSession();
    return null;
  }
}

export function persistSession(sessionId: string) {
  const payload: StoredSession = {
    sessionId,
    lastActiveAt: Date.now(),
  };
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
}

export function clearPersistedSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function getInitialSessionId(): string | null {
  return readPersistedSession()?.sessionId ?? null;
}

import type { SessionListItem } from "@repo/shared/defines/session";

function getSessionSearchText(session: SessionListItem): string {
  return [
    session.name || "Untitled",
    session.id,
    session.status,
    session.type,
    session.whiteboardPath,
  ]
    .join(" ")
    .toLowerCase();
}

export function filterSessionList(
  sessions: SessionListItem[],
  query: string,
): SessionListItem[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return sessions;

  return sessions.filter((session) =>
    getSessionSearchText(session).includes(normalizedQuery),
  );
}

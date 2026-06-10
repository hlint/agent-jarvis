import type { JSONValue } from "@repo/shared/defines/miscs";

export type ToolRecord = Record<string, JSONValue> | null;

export function asRecord(value: JSONValue): Record<string, JSONValue> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, JSONValue>;
  }
  return null;
}

export function asString(value: JSONValue): string | null {
  return typeof value === "string" ? value : null;
}

export function getStringField(record: ToolRecord, key: string): string | null {
  if (!record) return null;
  const value = record[key];
  return typeof value === "string" ? value : null;
}

export function getBooleanField(
  record: ToolRecord,
  key: string,
): boolean | null {
  if (!record) return null;
  const value = record[key];
  return typeof value === "boolean" ? value : null;
}

export function getNumberField(record: ToolRecord, key: string): number | null {
  if (!record) return null;
  const value = record[key];
  return typeof value === "number" ? value : null;
}

export function getArrayField(
  record: ToolRecord,
  key: string,
): JSONValue[] | null {
  if (!record) return null;
  const value = record[key];
  return Array.isArray(value) ? value : null;
}

export function truncateLines(text: string, maxLines: number): string {
  const lines = text.split("\n");
  if (lines.length <= maxLines) return text;
  return `${lines.slice(0, maxLines).join("\n")}…`;
}

export function formatEditFileDiff(input: Record<string, JSONValue>): string {
  const path = getStringField(input, "path") ?? "";
  const oldText = getStringField(input, "oldText") ?? "";
  const newText = getStringField(input, "newText") ?? "";
  const globalReplace = getBooleanField(input, "globalReplace") ?? false;

  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const maxLines = Math.max(oldLines.length, newLines.length);
  const lines: string[] = [`--- a/${path}`, `+++ b/${path}`];

  if (globalReplace) {
    lines.push("@@ global replace @@");
  }

  for (let i = 0; i < maxLines; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];
    if (oldLine !== undefined && newLine !== undefined && oldLine === newLine) {
      lines.push(` ${oldLine}`);
    } else {
      if (oldLine !== undefined) lines.push(`-${oldLine}`);
      if (newLine !== undefined) lines.push(`+${newLine}`);
    }
  }

  return lines.join("\n");
}

export const TOOL_BADGE_LABEL_MAX = 64;

/** CSS max-width for badge label truncation (visual width, not char count). */
export const TOOL_BADGE_LABEL_MAX_WIDTH_CLASS = "max-w-[18ch]";

export function shortPath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) return "";
  const isDir = trimmed.endsWith("/");
  const normalized = trimmed.replace(/\/+$/, "");
  const base = normalized.split("/").pop() ?? trimmed;
  return isDir ? `${base}/` : base;
}

export function normalizeBadgeText(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

export function shortText(text: string, max = 16): string {
  const trimmed = normalizeBadgeText(text);
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

export function shortUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return normalizeBadgeText(url);
  }
}

export function shortCommand(command: string): string {
  return normalizeBadgeText(command);
}

export function formatBadgeLabel(verb: string, object?: string | null): string {
  const trimmedObject = object?.trim();
  if (!trimmedObject) return verb;
  return `${verb}: ${trimmedObject}`;
}

/** When the icon already conveys the action, show only the object. */
export function formatBadgeObject(
  object?: string | null,
  fallback = "",
): string {
  const trimmedObject = object?.trim();
  if (trimmedObject) return trimmedObject;
  return fallback;
}

export function clampBadgeLabel(
  label: string,
  max = TOOL_BADGE_LABEL_MAX,
): string {
  if (label.length <= max) return label;
  return `${label.slice(0, max - 1)}…`;
}

export function pickWebSnippet(item: Record<string, JSONValue>): {
  title: string;
  url: string | null;
  snippet: string;
} {
  const title =
    getStringField(item, "title") ?? getStringField(item, "url") ?? "Untitled";
  const url = getStringField(item, "url");
  const snippet =
    getStringField(item, "content") ??
    getStringField(item, "snippet") ??
    getStringField(item, "raw_content") ??
    "";
  return { title, url, snippet };
}

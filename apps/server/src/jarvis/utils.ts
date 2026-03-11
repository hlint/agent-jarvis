import { join } from "node:path";
import { DIR_DIARIES } from "./defines";

export function stringifyFrontmatterMd(
  attributes: Record<string, any>,
  body: string,
): string {
  const lines = Object.entries(attributes).map(
    ([k, v]) => `${k}: ${String(v).replace(/\n/g, " ").trim()}`,
  );
  return `---\n${lines.join("\n")}\n---\n\n${body}`;
}

/** Diary path: DIR_DIARIES/YYYY/MM/DD.md */
export function getDiaryPath(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return join(DIR_DIARIES, String(y), m, `${d}.md`);
}

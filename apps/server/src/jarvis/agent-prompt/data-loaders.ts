import { join } from "node:path";
import fm from "front-matter";
import fs from "fs-extra";
import { DIR_MEMORIES, DIR_SKILLS } from "../defines";
import { getDiaryPath } from "../utils";

const SKILL_FILE = "SKILL.md";

export function getSkills(): Record<string, string> {
  const result: Record<string, string> = {};
  if (!fs.existsSync(DIR_SKILLS)) return result;
  const entries = fs.readdirSync(DIR_SKILLS, { withFileTypes: true });
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const skillPath = join(DIR_SKILLS, ent.name, SKILL_FILE);
    if (!fs.existsSync(skillPath)) continue;
    try {
      const raw = fs.readFileSync(skillPath, "utf-8");
      const { attributes } = fm(raw);
      const metadata = attributes as { name?: string; description?: string };
      const name = metadata.name ?? ent.name;
      result[name] = metadata.description ?? "";
    } catch {
      // skip this skill
    }
  }
  return result;
}

export function getLongTermMemory(): Record<string, string> {
  const result: Record<string, string> = {};
  if (!fs.existsSync(DIR_MEMORIES)) return result;
  const files = fs
    .readdirSync(DIR_MEMORIES)
    .filter((f) => f.endsWith(".md"))
    .sort();
  for (const f of files) {
    try {
      const content = fs.readFileSync(join(DIR_MEMORIES, f), "utf-8");
      const name = f.replace(/\.md$/, "");
      result[name] = content;
    } catch {
      // skip this file
    }
  }
  return result;
}

export function getRecentDiaries(): string {
  const now = new Date();
  const parts: string[] = [];

  for (let i = 2; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const path = getDiaryPath(d);
    if (fs.existsSync(path)) {
      parts.push(fs.readFileSync(path, "utf-8"));
    }
  }

  return parts.join("\n\n");
}

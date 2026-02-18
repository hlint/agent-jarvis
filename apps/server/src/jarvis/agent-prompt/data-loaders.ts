import { join } from "node:path";
import fm from "front-matter";
import fs from "fs-extra";
import { DIR_MEMORIES, DIR_SKILLS } from "../defines";
import { getDiaryPath } from "../utils";

const SKILL_FILE = "SKILL.md";

export function getSkills(): { name: string; description: string }[] {
  const list: { name: string; description: string }[] = [];
  try {
    if (!fs.existsSync(DIR_SKILLS)) return list;
    const entries = fs.readdirSync(DIR_SKILLS, { withFileTypes: true });
    for (const ent of entries) {
      if (!ent.isDirectory()) continue;
      const skillPath = join(DIR_SKILLS, ent.name, SKILL_FILE);
      if (!fs.existsSync(skillPath)) continue;
      const raw = fs.readFileSync(skillPath, "utf-8");
      const { attributes } = fm(raw);
      const metadata = attributes as { name?: string; description?: string };
      list.push({
        name: metadata.name ?? ent.name,
        description: metadata.description ?? "",
      });
    }
  } catch {
    // ignore
  }
  return list;
}

export function getLongTermMemory(): string {
  const parts: string[] = [];
  if (fs.existsSync(DIR_MEMORIES)) {
    const files = fs
      .readdirSync(DIR_MEMORIES)
      .filter((f) => f.endsWith(".md"))
      .sort();
    for (const f of files) {
      parts.push(fs.readFileSync(join(DIR_MEMORIES, f), "utf-8"));
    }
  }
  return parts.join("\n\n");
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

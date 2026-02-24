import { join, relative } from "node:path";
import fm from "front-matter";
import fs from "fs-extra";
import { DIR_NOTES, DIR_SKILLS } from "../defines";
import { getDiaryPath } from "../utils";

export function getSkills(): Record<string, string> {
  const result: Record<string, string> = {};
  if (!fs.existsSync(DIR_SKILLS)) return result;
  const entries = fs.readdirSync(DIR_SKILLS, { withFileTypes: true });
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const skillPath = join(DIR_SKILLS, ent.name, "SKILL.md");
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

function findMdFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const fullPath = join(dir, ent.name);
    if (ent.isDirectory()) {
      results.push(...findMdFiles(fullPath));
    } else if (ent.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }
  return results;
}

export function getNotes(): Array<{
  path: string;
  description: string;
  body: string;
}> {
  const notes: Array<{
    path: string;
    description: string;
    autoLoad: boolean;
    body: string;
  }> = [];
  const files = findMdFiles(DIR_NOTES);
  for (const filePath of files) {
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const { attributes, body } = fm<{
        path?: string;
        description?: string;
        autoLoad?: boolean;
      }>(raw);
      const relativePath = relative(DIR_NOTES, filePath).replace(/\\/g, "/");
      notes.push({
        path: relativePath,
        description: attributes.description ?? "",
        autoLoad: attributes.autoLoad ?? false,
        body: attributes.autoLoad ? body.trim() : "<Not Loaded>",
      });
    } catch {
      // skip this file
    }
  }
  return notes;
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

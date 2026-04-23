import { join, relative } from "node:path";
import fm from "front-matter";
import fs from "fs-extra";
import { DIR_NOTES, DIR_RUNTIME, DIR_SKILLS, PATH_SOUL } from "../defines";
import { getDiaryPath } from "../utils";

export function getSOUL(): string {
  if (!fs.existsSync(PATH_SOUL)) return "<SOUL.md Not Found>";
  return fs.readFileSync(PATH_SOUL, "utf-8");
}

export function getSkills(): Array<{
  name: string;
  description: string;
  path: string;
}> {
  const result: Array<{
    name: string;
    description: string;
    path: string;
  }> = [];
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
      const relativePath = relative(DIR_RUNTIME, skillPath).replace(/\\/g, "/");
      result.push({
        name,
        description: metadata.description ?? "",
        path: relativePath,
      });
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

export function getNotes() {
  const notes: Array<{
    path: string;
    content: string;
  }> = [];
  const files = findMdFiles(DIR_NOTES);
  for (const filePath of files) {
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const { attributes } = fm<{
        path?: string;
        description?: string;
        autoLoad?: boolean;
      }>(raw);
      const relativePath = relative(DIR_RUNTIME, filePath).replace(/\\/g, "/");
      const autoLoad = attributes.autoLoad ?? false;
      const parts = raw.split("---\n");
      notes.push({
        path: relativePath,
        content: autoLoad
          ? raw
          : ["", parts[1], "\n<Body Not Loaded>"].join("---\n"),
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

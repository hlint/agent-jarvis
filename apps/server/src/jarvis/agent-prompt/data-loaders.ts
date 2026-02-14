import { join } from "node:path";
import fm from "front-matter";
import fs from "fs-extra";
import { DIR_SKILLS, PATH_MEMORY } from "../defines";
import { getDiaryPath } from "../utils";

/** 当前注入的 SKILL 摘要。active 为 "true" 时包含完整内容（含 body），否则仅 name + description。 */
export function getSkills() {
  let list: {
    name: string;
    description: string;
    active: boolean;
    body: string;
  }[];
  try {
    const files = fs.readdirSync(DIR_SKILLS).filter((f) => f.endsWith(".md"));
    list = files.map((file) => {
      const raw = fs.readFileSync(join(DIR_SKILLS, file), "utf-8");
      const { attributes, body } = fm(raw);
      const metadata = attributes as {
        name?: string;
        description?: string;
        active?: boolean;
      };
      const name = metadata.name ?? "";
      const description = metadata.description ?? "";
      const active = metadata.active ?? false;
      return {
        name,
        description,
        active,
        body: active ? body : "Not loaded yet, recall it if you need it",
      };
    });
  } catch {
    list = [];
  }
  return list;
}

export function getLongTermMemory() {
  return fs.readFileSync(PATH_MEMORY, "utf8");
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

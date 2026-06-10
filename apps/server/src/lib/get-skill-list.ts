import { join } from "node:path";
import fm from "front-matter";
import fs from "fs-extra";
import { DIR_SKILLS } from "../jarvis/defines";

export default function getSkillList(): Array<{
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
      result.push({
        name,
        description: metadata.description ?? "",
        path: skillPath,
      });
    } catch (error) {
      console.error(`Failed to parse skill metadata for ${skillPath}:`, error);
      result.push({
        name: ent.name,
        description: `Failed to parse skill metadata for ${skillPath}, please check the skill file and fix the errors. Error: ${error instanceof Error ? error.message : String(error)}`,
        path: skillPath,
      });
    }
  }
  return result;
}

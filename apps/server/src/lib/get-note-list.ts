import { join } from "node:path";
import fs from "fs-extra";
import { DIR_NOTES } from "../jarvis/defines";
import { toDisplayPath } from "./runtime-path";

export default function getNoteList(): Array<{
  name: string;
  path: string;
  content: string;
}> {
  const result: Array<{
    name: string;
    path: string;
    content: string;
  }> = [];
  if (!fs.existsSync(DIR_NOTES)) return result;

  const entries = fs.readdirSync(DIR_NOTES, { withFileTypes: true });
  const mdFiles = entries
    .filter((ent) => ent.isFile() && ent.name.endsWith(".md"))
    .map((ent) => ent.name)
    .sort((a, b) => {
      if (a === "user.md") return -1;
      if (b === "user.md") return 1;
      return a.localeCompare(b);
    });

  for (const fileName of mdFiles) {
    const notePath = join(DIR_NOTES, fileName);
    try {
      const content = fs.readFileSync(notePath, "utf-8");
      result.push({
        name: fileName,
        path: toDisplayPath(notePath),
        content,
      });
    } catch (error) {
      console.error(`Failed to read note ${notePath}:`, error);
      result.push({
        name: fileName,
        path: toDisplayPath(notePath),
        content: `Failed to read note ${notePath}, please check the note file and fix the errors. Error: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }
  return result;
}

import { join } from "node:path";
import fs from "fs-extra";
import { z } from "zod";
import { defineJarvisTool } from "../tool";
import { getWorkspaceAbsolutePath } from "../workspace";

type ListEntry = {
  path: string;
  type: "file" | "dir";
  size?: number;
  childrenCount?: number;
};

function listDir(
  dirAbsolute: string,
  baseRelative: string,
  currentLevel: number,
  maxLevel: number,
  result: ListEntry[],
): void {
  const entries = fs.readdirSync(dirAbsolute, { withFileTypes: true });
  for (const entry of entries) {
    const relPath = baseRelative ? `${baseRelative}/${entry.name}` : entry.name;
    const fullPath = join(dirAbsolute, entry.name);
    if (entry.isFile()) {
      const stat = fs.statSync(fullPath);
      result.push({ path: relPath, type: "file", size: stat.size });
    } else if (entry.isDirectory()) {
      const childPath = fullPath;
      const childNames = fs.readdirSync(childPath);
      result.push({
        path: relPath,
        type: "dir",
        childrenCount: childNames.length,
      });
      if (currentLevel < maxLevel) {
        listDir(childPath, relPath, currentLevel + 1, maxLevel, result);
      }
    }
  }
}

export const workspaceListDirTool = defineJarvisTool({
  name: "workspace-list-dir",
  description:
    "List entries in a directory in the workspace. Path is relative to the workspace root (use '.' or '' for root). level 1 = current layer only, max 3. If the directory contains README.md, its content is returned as readmeContent.",
  inputSchema: z.object({
    path: z
      .string()
      .default(".")
      .describe(
        "Directory path relative to workspace root; use '.' or '' for root",
      ),
    level: z
      .number()
      .min(1)
      .max(3)
      .default(1)
      .describe(
        "Depth: 1 = only current directory entries; 2–3 = include subdirectories up to that depth",
      ),
  }),
  execute: async ({ path: relativePath, level }) => {
    const dirAbsolute = getWorkspaceAbsolutePath(relativePath || ".");
    if (!fs.existsSync(dirAbsolute)) {
      return { success: false, message: "Path does not exist" };
    }
    if (!fs.statSync(dirAbsolute).isDirectory()) {
      return { success: false, message: "Path is not a directory" };
    }
    const result: ListEntry[] = [];
    listDir(dirAbsolute, "", 1, level, result);

    const readmePath = join(dirAbsolute, "README.md");
    let readmeContent: string | null = null;
    if (fs.existsSync(readmePath) && fs.statSync(readmePath).isFile()) {
      readmeContent = fs.readFileSync(readmePath, "utf-8");
    }

    return { listEntries: result, readmeContent };
  },
});

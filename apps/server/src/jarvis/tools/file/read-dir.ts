import type { Stats } from "node:fs";
import path from "node:path";
import { tool } from "ai";
import fs from "fs-extra";
import z from "zod";
import { PATH_DESC, resolvePath, toDisplayPath } from "./path";

const MAX_DIR_DEPTH = 3;
const MAX_DIR_ENTRIES = 64;

type DirTreeEntry = {
  name: string;
  depth: number;
  isDirectory: boolean;
  isLast: boolean;
};

export default function createReadDirTool() {
  return tool({
    description:
      "Read directory structure as a text tree (up to 3 levels deep). " +
      "Lists at most 64 entries; if truncated, appends a ... and N more line.",
    inputSchema: z.object({
      path: z.string().describe(PATH_DESC),
    }),
    inputExamples: [{ input: { path: "." } }, { input: { path: "tmp" } }],
    execute: async (input) => {
      const dirPath = resolvePath(input.path);
      const stat = await fs.stat(dirPath);
      if (!stat.isDirectory()) {
        throw new Error(`Path is not a directory: ${toDisplayPath(dirPath)}`);
      }
      const rootLabel = toDisplayPath(dirPath).replace(/\/$/, "") || ".";
      const entries = await collectDirTreeEntries(dirPath, MAX_DIR_DEPTH);
      return formatDirTree(rootLabel, entries);
    },
  });
}

async function collectDirTreeEntries(
  dirPath: string,
  maxDepth: number,
): Promise<DirTreeEntry[]> {
  const entries: DirTreeEntry[] = [];

  async function walk(currentPath: string, depth: number): Promise<void> {
    let names: string[];
    try {
      names = await fs.readdir(currentPath);
    } catch {
      return;
    }

    const sortedNames = await sortDirEntries(currentPath, names);

    for (let i = 0; i < sortedNames.length; i++) {
      const name = sortedNames[i];
      const fullPath = path.join(currentPath, name);
      let stat: Stats;
      try {
        stat = await fs.stat(fullPath);
      } catch {
        continue;
      }

      const isDirectory = stat.isDirectory();
      const isLast = i === sortedNames.length - 1;
      entries.push({ name, depth, isDirectory, isLast });

      if (isDirectory && depth < maxDepth) {
        await walk(fullPath, depth + 1);
      }
    }
  }

  await walk(dirPath, 1);
  return entries;
}

async function sortDirEntries(
  dirPath: string,
  names: string[],
): Promise<string[]> {
  const withType = await Promise.all(
    names.map(async (name) => {
      try {
        const stat = await fs.stat(path.join(dirPath, name));
        return { name, isDirectory: stat.isDirectory() };
      } catch {
        return { name, isDirectory: false };
      }
    }),
  );

  return withType
    .sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) {
        return a.isDirectory ? -1 : 1;
      }
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    })
    .map((entry) => entry.name);
}

function formatDirTree(rootLabel: string, entries: DirTreeEntry[]): string {
  const total = entries.length;
  const shown = entries.slice(0, MAX_DIR_ENTRIES);
  const lines: string[] = [`${rootLabel}/`];

  const ancestorIsLast: boolean[] = [];

  for (const entry of shown) {
    ancestorIsLast.length = Math.max(0, entry.depth - 1);

    const prefix = buildTreePrefix(ancestorIsLast);
    const connector = entry.isLast ? "\\- " : "|- ";
    const suffix = entry.isDirectory ? "/" : "";
    lines.push(`${prefix}${connector}${entry.name}${suffix}`);

    ancestorIsLast[entry.depth - 1] = entry.isLast;
  }

  if (total > MAX_DIR_ENTRIES) {
    lines.push(
      `... and ${total - MAX_DIR_ENTRIES} more (${MAX_DIR_ENTRIES} shown of ${total})`,
    );
  }

  return lines.join("\n");
}

/** Vertical guides for ancestor levels; spaces when that branch has ended. */
function buildTreePrefix(ancestorIsLast: boolean[]): string {
  let prefix = "";
  for (const isLast of ancestorIsLast) {
    prefix += isLast ? "   " : "|  ";
  }
  return prefix;
}

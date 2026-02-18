import path from "node:path";
import fs from "fs-extra";
import { z } from "zod";
import { DIR_RUNTIME } from "../defines";
import { defineJarvisTool } from "../tool";

const MAX_FILE_CONTENT_LENGTH = 2 * 1024 * 1024; // 2MB

const PATH_DESC = "Path (relative to runtime if not absolute)";

function resolvePath(inputPath: string): string {
  return path.isAbsolute(inputPath)
    ? inputPath
    : path.join(path.resolve(DIR_RUNTIME), inputPath);
}

const ensureDirTool = defineJarvisTool({
  name: "ensure-dir",
  description: "Ensure directory exists. Creates dirs if needed.",
  inputSchema: z.object({
    brief: z.string().describe("Brief label"),
    path: z.string().describe(PATH_DESC),
  }),
  execute: async (input, _jarvis) => {
    await fs.ensureDir(resolvePath(input.path));
  },
});

const readFileTool = defineJarvisTool({
  name: "read-file",
  description: "Read file (utf-8)",
  inputSchema: z.object({
    brief: z.string().describe("Brief label"),
    path: z.string().describe(PATH_DESC),
  }),
  execute: async (input, _jarvis) => {
    const resolvedPath = resolvePath(input.path);
    const content = await fs.readFile(resolvedPath, "utf-8");
    if (content.length > MAX_FILE_CONTENT_LENGTH) {
      throw new Error(`File content is too large to read`);
    }
    return content;
  },
});

const writeFileTool = defineJarvisTool({
  name: "write-file",
  description: "Write file. Creates dirs if needed. Overwrites if exists.",
  inputSchema: z.object({
    brief: z.string().describe("Brief label"),
    path: z.string().describe(PATH_DESC),
    content: z.string().describe("Content"),
  }),
  execute: async (input, _jarvis) => {
    await fs.outputFile(resolvePath(input.path), input.content);
  },
});

const editFileTool = defineJarvisTool({
  name: "edit-file",
  description: "Replace oldText with newText. oldText must exist exactly.",
  inputSchema: z.object({
    brief: z.string().describe("Brief label"),
    path: z.string().describe(PATH_DESC),
    oldText: z.string().describe("Exact text to find"),
    newText: z.string().describe("Replacement"),
    globalReplace: z
      .boolean()
      .optional()
      .default(false)
      .describe("Replace all (default: first only)"),
  }),
  execute: async (input, _jarvis) => {
    const resolvedPath = resolvePath(input.path);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`File ${resolvedPath} does not exist`);
    }
    const content = await fs.readFile(resolvedPath, "utf-8");
    if (content.indexOf(input.oldText) === -1) {
      throw new Error(`File ${resolvedPath} does not contain the old text`);
    }
    const newContent = input.globalReplace
      ? content.replaceAll(input.oldText, input.newText)
      : content.replace(input.oldText, input.newText);
    await fs.outputFile(resolvedPath, newContent);
  },
});

const appendToFileTool = defineJarvisTool({
  name: "append-to-file",
  description: "Append to file. Creates dirs and file if not exists.",
  inputSchema: z.object({
    brief: z.string().describe("Brief label"),
    path: z.string().describe(PATH_DESC),
    content: z.string().describe("Content to append"),
  }),
  execute: async (input, _jarvis) => {
    await fs.ensureFile(resolvePath(input.path));
    await fs.appendFile(resolvePath(input.path), input.content);
  },
});

const listDirTool = defineJarvisTool({
  name: "list-dir",
  description: "List directory. Dir: dir/file count. File: size.",
  inputSchema: z.object({
    brief: z.string().describe("Brief label"),
    path: z.string().describe(PATH_DESC),
  }),
  execute: async (input, _jarvis) => {
    const dirPath = resolvePath(input.path);
    const names = await fs.readdir(dirPath);
    const results = await Promise.all(
      names.map(async (name) => {
        const fullPath = path.join(dirPath, name);
        const stat = await fs.stat(fullPath);
        if (stat.isDirectory()) {
          const children = await fs.readdir(fullPath);
          const childStats = await Promise.all(
            children.map((c) => fs.stat(path.join(fullPath, c))),
          );
          let dirCount = 0;
          let fileCount = 0;
          for (const s of childStats) {
            if (s.isDirectory()) dirCount++;
            else fileCount++;
          }
          return { name, type: "directory" as const, dirCount, fileCount };
        }
        return { name, type: "file" as const, size: stat.size };
      }),
    );
    return results;
  },
});

export const fileTools = [
  ensureDirTool,
  readFileTool,
  writeFileTool,
  editFileTool,
  appendToFileTool,
  listDirTool,
];

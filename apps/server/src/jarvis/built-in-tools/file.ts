import path from "node:path";
import fs from "fs-extra";
import { z } from "zod";
import { DIR_RUNTIME } from "../defines";
import { defineJarvisTool } from "../tool";

const MAX_FILE_CONTENT_LENGTH = 2 * 1024 * 1024; // 2MB

const PATH_DESC =
  "File path. If not absolute, it is resolved relative to the runtime directory.";

function resolvePath(inputPath: string): string {
  return path.isAbsolute(inputPath)
    ? inputPath
    : path.join(path.resolve(DIR_RUNTIME), inputPath);
}

const readFileTool = defineJarvisTool({
  name: "read-file",
  description: "Read a file and return the content(utf-8)",
  inputSchema: z.object({
    brief: z
      .string()
      .describe(
        "Short label for this read file action, e.g. 'read <filename>' or purpose",
      ),
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
  description:
    "Write a file with the given content. create the file(and its parent directories) if it doesn't exist. Overwrite the file if it exists.",
  inputSchema: z.object({
    brief: z
      .string()
      .describe(
        "Short label for this write file action, e.g. 'write <filename>' or purpose",
      ),
    path: z.string().describe(PATH_DESC),
    content: z.string().describe("The content to write to the file"),
  }),
  execute: async (input, _jarvis) => {
    await fs.outputFile(resolvePath(input.path), input.content);
  },
});

const editFileTool = defineJarvisTool({
  name: "edit-file",
  description:
    "Edit a file by replacing oldText with newText. The oldText must exist exactly in the file.",
  inputSchema: z.object({
    brief: z
      .string()
      .describe(
        "Short label for this edit file action, e.g. 'edit <filename>' or purpose",
      ),
    path: z.string().describe(PATH_DESC),
    oldText: z.string().describe("The exact text to find and replace"),
    newText: z.string().describe("The text to replace with"),
    globalReplace: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        "If true, replace all occurrences of oldText. If false, replace only the first.",
      ),
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
  description:
    "Append a file with the given content. create the file(and its parent directories) if it doesn't exist.",
  inputSchema: z.object({
    brief: z
      .string()
      .describe(
        "Short label for this append to file action, e.g. 'append <filename>' or purpose",
      ),
    path: z.string().describe(PATH_DESC),
    content: z.string().describe("The content to append to the file"),
  }),
  execute: async (input, _jarvis) => {
    await fs.appendFile(resolvePath(input.path), input.content);
  },
});

const listDirTool = defineJarvisTool({
  name: "list-dir",
  description:
    "List the contents of a directory. For each item: if it is a directory, returns the count of directories and files it contains; if it is a file, returns its size in bytes.",
  inputSchema: z.object({
    brief: z
      .string()
      .describe(
        "Short label for this list dir action, e.g. 'list <dirname>' or purpose",
      ),
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
  readFileTool,
  writeFileTool,
  editFileTool,
  appendToFileTool,
  listDirTool,
];

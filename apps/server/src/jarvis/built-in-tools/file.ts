import path from "node:path";
import fs from "fs-extra";
import { z } from "zod";
import { defineJarvisTool } from "../tool";

const MAX_FILE_CONTENT_LENGTH = 2 * 1024 * 1024; // 2MB

const readFileTool = defineJarvisTool({
  name: "read-file",
  description: "Read a file and return the content(utf-8)",
  inputSchema: z.object({
    brief: z
      .string()
      .describe(
        "Short label for this read file action, e.g. 'read <filename>' or purpose",
      ),
    path: z.string().describe("The path of the file to read"),
  }),
  execute: async (input, _jarvis) => {
    const { path } = input;
    const content = await fs.readFile(path, "utf-8");
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
    path: z.string().describe("The path of the file to write"),
    content: z.string().describe("The content to write to the file"),
  }),
  execute: async (input, _jarvis) => {
    const { path, content } = input;
    await fs.outputFile(path, content);
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
    path: z.string().describe("The path of the file to edit"),
    oldText: z.string().describe("The exact text to find and replace"),
    newText: z.string().describe("The text to replace with"),
  }),
  execute: async (input, _jarvis) => {
    const { path, oldText, newText } = input;
    if (!fs.existsSync(path)) {
      throw new Error(`File ${path} does not exist`);
    }
    const content = await fs.readFile(path, "utf-8");
    if (content.indexOf(oldText) === -1) {
      throw new Error(`File ${path} does not contain the old text`);
    }
    await fs.outputFile(path, content.replace(oldText, newText));
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
    path: z.string().describe("The path of the file to append"),
    content: z.string().describe("The content to append to the file"),
  }),
  execute: async (input, _jarvis) => {
    const { path, content } = input;
    await fs.appendFile(path, content);
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
    path: z.string().describe("The path of the directory to list"),
  }),
  execute: async (input, _jarvis) => {
    const { path: dirPath } = input;
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

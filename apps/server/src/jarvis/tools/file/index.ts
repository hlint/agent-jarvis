import { type ToolSet, tool } from "ai";
import fs from "fs-extra";
import z from "zod";
import {
  MAX_FILE_CONTENT_LENGTH,
  PATH_DESC,
  resolvePath,
  toDisplayPath,
} from "./path";
import createReadDirTool from "./read-dir";

export default function createFileTools(): ToolSet {
  return {
    ensure_dir: tool({
      description:
        "Ensure directory exists. Creates parent directories if needed.",
      inputSchema: z.object({
        path: z.string().describe(PATH_DESC),
      }),
      inputExamples: [{ input: { path: "tmp/my-project" } }],
      execute: async (input) => {
        const resolvedPath = resolvePath(input.path);
        await fs.ensureDir(resolvedPath);
        return { ok: true, path: toDisplayPath(resolvedPath) };
      },
    }),

    read_file: tool({
      description: "Read a file as utf-8 text.",
      inputSchema: z.object({
        path: z.string().describe(PATH_DESC),
      }),
      inputExamples: [{ input: { path: "tmp/bun-test/main.ts" } }],
      execute: async (input) => {
        const resolvedPath = resolvePath(input.path);
        const content = await fs.readFile(resolvedPath, "utf-8");
        if (content.length > MAX_FILE_CONTENT_LENGTH) {
          throw new Error(
            `File content is too large to read (${content.length} bytes, max ${MAX_FILE_CONTENT_LENGTH})`,
          );
        }
        return content;
      },
    }),

    write_file: tool({
      description:
        "Write a file. Creates parent directories if needed. Overwrites if the file already exists.",
      inputSchema: z.object({
        path: z.string().describe(PATH_DESC),
        content: z.string().describe("Full file content"),
      }),
      inputExamples: [
        {
          input: {
            path: "tmp/hello.txt",
            content: "Hello, world!\n",
          },
        },
      ],
      execute: async (input) => {
        const resolvedPath = resolvePath(input.path);
        await fs.outputFile(resolvedPath, input.content);
        return {
          ok: true,
          path: toDisplayPath(resolvedPath),
          bytes: Buffer.byteLength(input.content, "utf-8"),
        };
      },
    }),

    edit_file: tool({
      description:
        "Replace oldText with newText in a file. oldText must exist exactly once unless globalReplace is true.",
      inputSchema: z.object({
        path: z.string().describe(PATH_DESC),
        oldText: z.string().describe("Exact text to find"),
        newText: z.string().describe("Replacement text"),
        globalReplace: z
          .boolean()
          .optional()
          .describe("Replace all occurrences (default: first only)"),
      }),
      inputExamples: [
        {
          input: {
            path: "tmp/bun-test/main.ts",
            oldText: "console.log('hello');",
            newText: "console.log('world');",
          },
        },
      ],
      execute: async (input) => {
        const resolvedPath = resolvePath(input.path);
        if (!fs.existsSync(resolvedPath)) {
          throw new Error(`File ${toDisplayPath(resolvedPath)} does not exist`);
        }
        const content = await fs.readFile(resolvedPath, "utf-8");
        if (content.indexOf(input.oldText) === -1) {
          throw new Error(
            `File ${toDisplayPath(resolvedPath)} does not contain the old text`,
          );
        }
        const newContent =
          (input.globalReplace ?? false)
            ? content.replaceAll(input.oldText, input.newText)
            : content.replace(input.oldText, input.newText);
        await fs.outputFile(resolvedPath, newContent);
        return { ok: true, path: toDisplayPath(resolvedPath) };
      },
    }),

    append_to_file: tool({
      description:
        "Append text to a file. Creates parent directories and the file if they do not exist.",
      inputSchema: z.object({
        path: z.string().describe(PATH_DESC),
        content: z.string().describe("Content to append"),
      }),
      inputExamples: [
        {
          input: {
            path: "tmp/log.txt",
            content: "new line\n",
          },
        },
      ],
      execute: async (input) => {
        const resolvedPath = resolvePath(input.path);
        await fs.ensureFile(resolvedPath);
        await fs.appendFile(resolvedPath, input.content);
        return {
          ok: true,
          path: toDisplayPath(resolvedPath),
          bytes: Buffer.byteLength(input.content, "utf-8"),
        };
      },
    }),

    read_dir: createReadDirTool(),
  };
}

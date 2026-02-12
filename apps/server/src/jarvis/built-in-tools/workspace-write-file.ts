import { dirname } from "node:path";
import fs from "fs-extra";
import { z } from "zod";
import { defineJarvisTool } from "../tool";
import { getWorkspaceAbsolutePath } from "../workspace";

export const workspaceWriteFileTool = defineJarvisTool({
  name: "workspace_write_file",
  description:
    "Write content to one or more files in the workspace. Paths are relative to the workspace root. Creates parent directories if needed. The workspace .env file is protected and cannot be written. Returns an array of { path, success } or { path, error } per file.",
  inputSchema: z.object({
    files: z
      .array(
        z.object({
          path: z
            .string()
            .describe(
              "Path relative to workspace root, e.g. 'a.js' or 'src/foo.js'",
            ),
          content: z.string().describe("File content to write"),
        }),
      )
      .min(1)
      .describe("Array of { path, content } to write"),
  }),
  execute: async ({ files }) => {
    const results: { path: string; success?: boolean; error?: string }[] = [];
    for (const { path: rel, content } of files) {
      try {
        const absolute = getWorkspaceAbsolutePath(rel);
        fs.ensureDirSync(dirname(absolute));
        fs.writeFileSync(absolute, content, "utf-8");
        results.push({ path: rel, success: true });
      } catch (err) {
        results.push({
          path: rel,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
    return results;
  },
});

import fs from "fs-extra";
import { z } from "zod";
import { defineJarvisTool } from "../tool";
import { getWorkspaceAbsolutePath } from "../workspace";

export const workspaceReadFileTool = defineJarvisTool({
  name: "workspace-read-file",
  description:
    "Read one or more files from the workspace. Paths are relative to the workspace root (e.g. 'a.js' or 'src/foo.js'). Returns an array of { path, content } or { path, error } per file.",
  inputSchema: z.object({
    paths: z
      .array(z.string())
      .min(1)
      .describe(
        "Paths relative to workspace root, e.g. ['a.js', 'scripts/foo.js']",
      ),
  }),
  execute: async ({ paths: relativePaths }) => {
    const results: { path: string; content?: string; error?: string }[] = [];
    for (const rel of relativePaths) {
      try {
        const absolute = getWorkspaceAbsolutePath(rel);
        if (!fs.existsSync(absolute)) {
          results.push({ path: rel, error: "File does not exist" });
          continue;
        }
        if (!fs.statSync(absolute).isFile()) {
          results.push({ path: rel, error: "Path is not a file" });
          continue;
        }
        const content = fs.readFileSync(absolute, "utf-8");
        results.push({ path: rel, content });
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

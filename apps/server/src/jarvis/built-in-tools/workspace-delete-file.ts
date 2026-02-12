import fs from "fs-extra";
import { z } from "zod";
import { defineJarvisTool } from "../tool";
import { getWorkspaceAbsolutePath } from "../workspace";

export const workspaceDeleteFileTool = defineJarvisTool({
  name: "workspace_delete_file",
  description:
    "Delete one or more files or directories in the workspace. Paths are relative to the workspace root (e.g. 'a.js', 'temp/', 'old-scripts/'). Deleting a directory removes it recursively. Returns an array of { path, success } or { path, error } per path.",
  inputSchema: z.object({
    paths: z
      .array(z.string())
      .min(1)
      .describe(
        "Paths relative to workspace root to delete, e.g. ['a.js', 'temp/', 'old-scripts/']",
      ),
  }),
  execute: async ({ paths: relativePaths }) => {
    const results: { path: string; success?: boolean; error?: string }[] = [];
    for (const rel of relativePaths) {
      try {
        const absolute = getWorkspaceAbsolutePath(rel);
        if (!fs.existsSync(absolute)) {
          results.push({ path: rel, error: "Path does not exist" });
          continue;
        }
        fs.removeSync(absolute);
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

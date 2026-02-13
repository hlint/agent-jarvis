import { dirname } from "node:path";
import fs from "fs-extra";
import { z } from "zod";
import { defineJarvisTool } from "../tool";
import { getWorkspaceAbsolutePath, getWsAbsolutePath } from "../workspace";

export const workspaceRenameFileTool = defineJarvisTool({
  name: "workspace_rename_file",
  description:
    "Rename or move one or more files or directories in the workspace. Paths are relative to the workspace root. Returns an array of { path, newPath, success } or { path, error } per path.",
  inputSchema: z.object({
    moves: z
      .array(
        z.object({
          path: z
            .string()
            .describe(
              "Current path relative to workspace root, e.g. 'a.js' or 'src/foo.js'",
            ),
          newPath: z
            .string()
            .describe(
              "New path relative to workspace root, e.g. 'b.js' or 'src/bar.js'",
            ),
        }),
      )
      .min(1)
      .describe("Array of { path, newPath } to rename/move"),
  }),
  execute: async ({ moves }) => {
    const results: {
      path: string;
      newPath?: string;
      success?: boolean;
      error?: string;
    }[] = [];
    const wsBase = getWsAbsolutePath();
    for (const { path: rel, newPath: newRel } of moves) {
      try {
        const absolute = getWorkspaceAbsolutePath(rel);
        const newAbsolute = getWorkspaceAbsolutePath(newRel);

        // Prevent renaming/moving the entire workspace root directory
        if (absolute === wsBase || rel === "." || rel === "") {
          results.push({
            path: rel,
            newPath: newRel,
            error: "Cannot rename or move the entire workspace root directory",
          });
          continue;
        }

        if (!fs.existsSync(absolute)) {
          results.push({ path: rel, error: "Path does not exist" });
          continue;
        }

        if (fs.existsSync(newAbsolute)) {
          results.push({
            path: rel,
            newPath: newRel,
            error: "Target path already exists",
          });
          continue;
        }

        fs.ensureDirSync(dirname(newAbsolute));
        fs.moveSync(absolute, newAbsolute);
        results.push({ path: rel, newPath: newRel, success: true });
      } catch (err) {
        results.push({
          path: rel,
          newPath: newRel,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
    return results;
  },
});

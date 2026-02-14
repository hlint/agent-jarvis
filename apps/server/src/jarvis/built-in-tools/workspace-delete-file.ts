import { dirname, join, relative } from "node:path";
import fs from "fs-extra";
import { z } from "zod";
import { DIR_WORKSPACE } from "../defines";
import { defineJarvisTool } from "../tool";
import { getWorkspaceAbsolutePath, getWsAbsolutePath } from "../workspace";

const RECYCLE_BIN_SUBDIR = "recycle-bin";

/**
 * Get the absolute path to the recycle bin directory.
 */
function getRecycleBinAbsolutePath(): string {
  return join(DIR_WORKSPACE, RECYCLE_BIN_SUBDIR);
}

/**
 * Move a file/directory from workspace to recycle bin, preserving the relative path structure.
 * For example: ws/a/b.js -> recycle-bin/a/b.js
 */
function moveToRecycleBin(workspaceAbsolutePath: string): void {
  const wsBase = getWsAbsolutePath();
  const recycleBinBase = getRecycleBinAbsolutePath();

  // Get relative path from ws/ base
  const relPath = relative(wsBase, workspaceAbsolutePath);
  if (relPath.startsWith("..")) {
    throw new Error("Path is outside workspace");
  }
  if (relPath === "." || relPath === "") {
    throw new Error("Cannot move workspace root directory");
  }

  // Target path in recycle bin
  const recycleBinPath = join(recycleBinBase, relPath);

  // Ensure parent directory exists
  fs.ensureDirSync(dirname(recycleBinPath));

  // Move file/directory (overwrite if target exists)
  if (fs.existsSync(recycleBinPath)) {
    fs.removeSync(recycleBinPath);
  }
  fs.moveSync(workspaceAbsolutePath, recycleBinPath);
}

export const workspaceDeleteFileTool = defineJarvisTool({
  name: "workspace-delete-file",
  description:
    "Delete one or more files or directories in the workspace. Paths are relative to the workspace root (e.g. 'a.js', 'temp/', 'old-scripts/'). Deleting a directory removes it recursively. Files are moved to recycle bin. Returns an array of { path, success } or { path, error } per path.",
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
    const wsBase = getWsAbsolutePath();
    for (const rel of relativePaths) {
      try {
        const absolute = getWorkspaceAbsolutePath(rel);

        // Prevent deleting the entire workspace root directory
        if (absolute === wsBase || rel === "." || rel === "") {
          results.push({
            path: rel,
            error: "Cannot delete the entire workspace root directory",
          });
          continue;
        }

        if (!fs.existsSync(absolute)) {
          results.push({ path: rel, error: "Path does not exist" });
          continue;
        }
        moveToRecycleBin(absolute);
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

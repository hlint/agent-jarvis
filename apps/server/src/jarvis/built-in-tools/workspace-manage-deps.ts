import { z } from "zod";
import { defineJarvisTool } from "../tool";
import { getWsAbsolutePath } from "../workspace";

const DEP_TIMEOUT_MS = 60_000; // 60 seconds for package operations
const MAX_OUTPUT_BYTES = 2 * 1024 * 1024; // 2MB

export const workspaceManageDeps = defineJarvisTool({
  name: "workspace_manage_deps",
  description:
    "Add or remove npm packages in the workspace. Uses `bun add` and `bun rm` to modify workspace package.json. Provide at least one of `add` or `remove`.",
  inputSchema: z
    .object({
      brief: z
        .string()
        .describe(
          "Short label, e.g. 'add axios and lodash' or 'remove unused packages'",
        ),
      add: z
        .array(z.string())
        .optional()
        .describe(
          "Packages to add (e.g. ['axios', 'lodash@4.17.21']); runs `bun add`",
        ),
      remove: z
        .array(z.string())
        .optional()
        .describe("Packages to remove (e.g. ['axios']); runs `bun rm`"),
    })
    .refine((data) => data.add || data.remove, {
      message: "At least one of 'add' or 'remove' must be provided",
    }),
  execute: async ({ add, remove }) => {
    const cwd = getWsAbsolutePath();
    const results: {
      added?: string[];
      removed?: string[];
      stdout: string;
      stderr: string;
      success: boolean;
    } = {
      stdout: "",
      stderr: "",
      success: true,
    };

    // Add packages
    if (add && add.length > 0) {
      const proc = Bun.spawnSync({
        cmd: ["bun", "add", ...add],
        cwd,
        timeout: DEP_TIMEOUT_MS,
        maxBuffer: MAX_OUTPUT_BYTES,
        stdout: "pipe",
        stderr: "pipe",
      });

      results.stdout += proc.stdout?.toString("utf-8") ?? "";
      results.stderr += proc.stderr?.toString("utf-8") ?? "";

      if (proc.success) {
        results.added = add;
      } else {
        results.success = false;
      }
    }

    // Remove packages
    if (remove && remove.length > 0) {
      const proc = Bun.spawnSync({
        cmd: ["bun", "rm", ...remove],
        cwd,
        timeout: DEP_TIMEOUT_MS,
        maxBuffer: MAX_OUTPUT_BYTES,
        stdout: "pipe",
        stderr: "pipe",
      });

      results.stdout += proc.stdout?.toString("utf-8") ?? "";
      results.stderr += proc.stderr?.toString("utf-8") ?? "";

      if (proc.success) {
        results.removed = remove;
      } else {
        results.success = false;
      }
    }

    return results;
  },
});

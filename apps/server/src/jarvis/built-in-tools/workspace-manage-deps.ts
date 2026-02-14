import { z } from "zod";
import { defineJarvisTool } from "../tool";
import { getWsAbsolutePath, runBun } from "../workspace";

export const workspaceManageDeps = defineJarvisTool({
  name: "workspace-manage-deps",
  description:
    "Add or remove npm packages in the workspace. Uses `bun add` and `bun rm` to modify workspace package.json. Provide at least one of `add` or `remove`.",
  inputSchema: z
    .object({
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
      const { stdout, stderr, exitCode } = await runBun(
        ["bun", "add", ...add],
        cwd,
      );
      results.stdout += stdout;
      results.stderr += stderr;
      if (exitCode === 0) {
        results.added = add;
      } else {
        results.success = false;
      }
    }

    // Remove packages
    if (remove && remove.length > 0) {
      const { stdout, stderr, exitCode } = await runBun(
        ["bun", "rm", ...remove],
        cwd,
      );
      results.stdout += stdout;
      results.stderr += stderr;
      if (exitCode === 0) {
        results.removed = remove;
      } else {
        results.success = false;
      }
    }

    return results;
  },
});

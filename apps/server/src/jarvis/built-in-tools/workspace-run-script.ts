import fs from "fs-extra";
import { z } from "zod";
import { defineJarvisTool } from "../tool";
import { getWorkspaceAbsolutePath, getWsAbsolutePath } from "../workspace";

const RUN_TIMEOUT_MS = 20_000; // 20 seconds
const MAX_OUTPUT_BYTES = 2 * 1024 * 1024; // 2MB

export const workspaceRunScriptTool = defineJarvisTool({
  name: "workspace_run_script",
  description:
    "Run a JavaScript file in the workspace with Bun. Path is relative to the workspace ws/ directory (e.g. 'a.js'). Optional args are passed as CLI arguments (script can read process.argv). Time and output size are limited. Returns stdout, stderr, and exit code.",
  inputSchema: z.object({
    brief: z.string().describe("Short label, e.g. 'run a.js'"),
    path: z
      .string()
      .describe(
        "Path to the script relative to workspace root (must start with 'ws/'), e.g. 'ws/a.js'",
      ),
    args: z
      .array(z.string())
      .optional()
      .describe(
        "CLI arguments passed to the script (e.g. ['--input', 'data.json']); script reads process.argv",
      ),
  }),
  execute: async ({ path: relativePath, args }) => {
    const absolutePath = getWorkspaceAbsolutePath(relativePath);
    if (!fs.existsSync(absolutePath)) {
      return { success: false, error: "File does not exist" };
    }
    if (!fs.statSync(absolutePath).isFile()) {
      return { success: false, error: "Path is not a file" };
    }

    // cwd = workspace directory; .env is loaded if present
    const cwd = getWsAbsolutePath();
    const proc = Bun.spawnSync({
      cmd: ["bun", "--env-file", "../.env", absolutePath, ...(args ?? [])],
      cwd,
      timeout: RUN_TIMEOUT_MS,
      maxBuffer: MAX_OUTPUT_BYTES,
      stdout: "pipe",
      stderr: "pipe",
    });

    const stdout = proc.stdout?.toString("utf-8") ?? "";
    const stderr = proc.stderr?.toString("utf-8") ?? "";

    return {
      stdout,
      stderr,
      exitCode: proc.exitCode ?? null,
      success: proc.success ?? false,
      ...(proc.exitedDueToTimeout && { exitedDueToTimeout: true }),
    };
  },
});

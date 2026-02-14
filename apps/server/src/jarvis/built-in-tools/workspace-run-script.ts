import { shortId } from "@repo/shared/lib/utils";
import fs from "fs-extra";
import { z } from "zod";
import { defineJarvisTool } from "../tool";
import {
  getWorkspaceAbsolutePath,
  getWsAbsolutePath,
  runBun,
} from "../workspace";

const RUN_SCRIPT_TIMEOUT_MS = 20_000; // 20 seconds for script execution

export const workspaceRunScriptTool = defineJarvisTool({
  name: "workspace-run-script",
  description:
    "Run JavaScript in the workspace with Bun. Two modes (mutually exclusive): (1) path: run an existing file relative to workspace root (e.g. 'a.js'). (2) inline: pass JS code as text; a temp file will be created, run, then deleted. Returns stdout, stderr, exit code.",
  inputSchema: z
    .object({
      path: z
        .string()
        .optional()
        .describe(
          "Path to script relative to workspace root (use path OR inline, not both)",
        ),
      inline: z
        .string()
        .optional()
        .describe(
          "Inline JS code to run (use inline OR path, not both). Temp file is created, executed, then removed.",
        ),
      params: z
        .record(z.string(), z.any())
        .optional()
        .default({})
        .describe("Parameters passed to the script (e.g. { 'name': 'value' })"),
    })
    .refine(
      (data) => {
        const hasPath = !!data.path?.trim();
        const hasInline = data.inline !== undefined && data.inline !== null;
        return (hasPath && !hasInline) || (!hasPath && hasInline);
      },
      { message: "Provide exactly one of path or inline" },
    ),
  execute: async ({ path: relativePath, inline, params = {} }) => {
    const cwd = getWsAbsolutePath();
    let absolutePath: string;
    let tempPath: string | null = null;

    if (inline !== undefined && inline !== null) {
      tempPath = getWorkspaceAbsolutePath(`${shortId()}.js`);
      await fs.writeFile(tempPath, inline, "utf-8");
      absolutePath = tempPath;
    } else if (relativePath) {
      absolutePath = getWorkspaceAbsolutePath(relativePath);
      if (!fs.existsSync(absolutePath)) {
        return { success: false, error: "File does not exist" };
      }
      if (!fs.statSync(absolutePath).isFile()) {
        return { success: false, error: "Path is not a file" };
      }
    } else {
      return { success: false, error: "Provide path or inline" };
    }

    try {
      const result = await runBun(
        [
          "bun",
          "--env-file",
          "../.env",
          absolutePath,
          "--params",
          JSON.stringify(params),
        ],
        cwd,
        { timeoutMs: RUN_SCRIPT_TIMEOUT_MS },
      );
      return {
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        success: result.exitCode === 0,
        ...(result.exitedDueToTimeout && { exitedDueToTimeout: true }),
      };
    } finally {
      if (tempPath && fs.existsSync(tempPath)) {
        await fs.remove(tempPath);
      }
    }
  },
});

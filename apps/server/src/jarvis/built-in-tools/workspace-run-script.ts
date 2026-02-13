import { shortId } from "@repo/shared/lib/utils";
import fs from "fs-extra";
import { z } from "zod";
import { defineJarvisTool } from "../tool";
import { getWorkspaceAbsolutePath, getWsAbsolutePath } from "../workspace";

const RUN_TIMEOUT_MS = 20_000; // 20 seconds
const MAX_OUTPUT_BYTES = 2 * 1024 * 1024; // 2MB

export const workspaceRunScriptTool = defineJarvisTool({
  name: "workspace_run_script",
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
      const proc = Bun.spawnSync({
        cmd: [
          "bun",
          "--env-file",
          "../.env",
          absolutePath,
          "--params",
          JSON.stringify(params),
        ],
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
    } finally {
      if (tempPath && fs.existsSync(tempPath)) {
        await fs.remove(tempPath);
      }
    }
  },
});

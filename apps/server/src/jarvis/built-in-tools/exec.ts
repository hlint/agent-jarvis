import path from "node:path";
import z from "zod";
import { DIR_RUNTIME } from "../defines";
import { defineJarvisTool } from "../tool";

export const execTool = defineJarvisTool({
  name: "exec",
  description: "Execute a command and return the output",
  inputSchema: z.object({
    command: z.string().describe("The command to execute"),
    cwd: z
      .string()
      .optional()
      .describe(
        "Working directory. If not absolute, resolved relative to runtime. Default: runtime root.",
      ),
  }),
  execute: async (input, _jarvis) => {
    const cwd = input.cwd
      ? path.isAbsolute(input.cwd)
        ? input.cwd
        : path.join(path.resolve(DIR_RUNTIME), input.cwd)
      : path.resolve(DIR_RUNTIME);
    const result = await runBun(input.command.split(" ").filter(Boolean), cwd, {
      timeoutMs: 60_000,
      maxOutputBytes: 2 * 1024 * 1024,
    });
    return result;
  },
});

/** Default timeout (ms) for runBun. */
const RUN_BUN_DEFAULT_TIMEOUT_MS = 60_000;
/** Default max bytes for runBun stdout/stderr before truncation. */
const RUN_BUN_DEFAULT_MAX_OUTPUT_BYTES = 2 * 1024 * 1024;

type RunBunResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
  /** True when the process was killed due to timeout. */
  exitedDueToTimeout?: boolean;
};

/**
 * Run a command with Bun.spawn in the given cwd. Reads stdout/stderr via .text(), enforces timeout, truncates output.
 */
async function runBun(
  cmd: string[],
  cwd: string,
  options?: {
    timeoutMs?: number;
    maxOutputBytes?: number;
  },
): Promise<RunBunResult> {
  const timeoutMs = options?.timeoutMs ?? RUN_BUN_DEFAULT_TIMEOUT_MS;
  const maxOutputBytes =
    options?.maxOutputBytes ?? RUN_BUN_DEFAULT_MAX_OUTPUT_BYTES;
  const proc = Bun.spawn({
    cmd,
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  });
  let exitCode: number;
  let exitedDueToTimeout = false;
  try {
    exitCode = await Promise.race([
      proc.exited,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), timeoutMs),
      ),
    ]);
  } catch {
    proc.kill();
    exitedDueToTimeout = true;
    exitCode = await proc.exited;
  }
  const stdout = await (
    proc.stdout as ReadableStream<Uint8Array> & { text(): Promise<string> }
  ).text();
  const stderr = await (
    proc.stderr as ReadableStream<Uint8Array> & { text(): Promise<string> }
  ).text();
  const truncate = (s: string) =>
    s.length > maxOutputBytes
      ? `${s.slice(0, maxOutputBytes)}\n...[truncated]`
      : s;
  return {
    stdout: truncate(stdout),
    stderr: truncate(stderr),
    exitCode,
    ...(exitedDueToTimeout && { exitedDueToTimeout: true }),
  };
}

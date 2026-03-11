import path from "node:path";
import z from "zod";
import { DIR_RUNTIME } from "../defines";
import { defineJarvisTool } from "../tool";

export const execTool = defineJarvisTool({
  name: "exec",
  description:
    "Execute a command and return the result. Result: stdout (string), stderr (string), exitCode (number), exitedDueToTimeout? (true if killed by timeout)",
  inputSchema: z.object({
    command: z.string().describe("Command"),
    cwd: z
      .string()
      .optional()
      .describe("Working dir (relative to runtime if not absolute)"),
  }),
  execute: async (input, _jarvis) => {
    const cwd = input.cwd
      ? path.isAbsolute(input.cwd)
        ? input.cwd
        : path.join(path.resolve(DIR_RUNTIME), input.cwd)
      : path.resolve(DIR_RUNTIME);
    const result = await runBun(input.command, cwd, {});
    return result;
  },
});

/** Default timeout (ms) for runBun. */
const RUN_BUN_DEFAULT_TIMEOUT_MS = 20_000;
/** Max ms to wait for stdout/stderr to drain after process exit. */
const RUN_BUN_STREAM_DRAIN_TIMEOUT_MS = 5_000;
/** Default max bytes for runBun stdout/stderr before truncation. */
const RUN_BUN_DEFAULT_MAX_OUTPUT_BYTES = 1 * 1024 * 1024;

type RunBunResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
  /** True when the process was killed due to timeout. */
  exitedDueToTimeout?: boolean;
};

/**
 * Run a command via shell (sh -c / cmd /c) so quoting and pipes work like in a terminal.
 */
async function runBun(
  cmd: string,
  cwd: string,
  options?: {
    timeoutMs?: number;
    maxOutputBytes?: number;
  },
): Promise<RunBunResult> {
  const timeoutMs = options?.timeoutMs ?? RUN_BUN_DEFAULT_TIMEOUT_MS;
  const maxOutputBytes =
    options?.maxOutputBytes ?? RUN_BUN_DEFAULT_MAX_OUTPUT_BYTES;
  const shellCmd =
    process.platform === "win32" ? ["cmd.exe", "/c", cmd] : ["sh", "-c", cmd];
  const proc = Bun.spawn({
    cmd: shellCmd,
    cwd,
    stdout: "pipe",
    stderr: "pipe",
    detached: process.platform !== "win32",
  });
  // Consume streams immediately to avoid pipe buffer deadlock
  const stdoutPromise = (
    proc.stdout as ReadableStream<Uint8Array> & { text(): Promise<string> }
  ).text();
  const stderrPromise = (
    proc.stderr as ReadableStream<Uint8Array> & { text(): Promise<string> }
  ).text();

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
    exitedDueToTimeout = true;
    if (process.platform !== "win32" && proc.pid) {
      process.kill(-proc.pid, "SIGKILL");
    } else {
      proc.kill("SIGKILL");
    }
    exitCode = await Promise.race([
      proc.exited,
      new Promise<number>((_, reject) =>
        setTimeout(() => reject(new Error("kill timeout")), 5000),
      ),
    ]).catch(() => 137);
  }
  const drainTimeout = () =>
    new Promise<string>((resolve) =>
      setTimeout(
        () => resolve("[stream drain timeout]"),
        RUN_BUN_STREAM_DRAIN_TIMEOUT_MS,
      ),
    );
  const stdout = await Promise.race([stdoutPromise, drainTimeout()]);
  const stderr = await Promise.race([stderrPromise, drainTimeout()]);
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

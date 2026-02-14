import { relative, resolve } from "node:path";
import { DIR_WORKSPACE } from "./defines";

/** Default timeout (ms) for runBun. */
export const RUN_BUN_DEFAULT_TIMEOUT_MS = 60_000;
/** Default max bytes for runBun stdout/stderr before truncation. */
export const RUN_BUN_DEFAULT_MAX_OUTPUT_BYTES = 2 * 1024 * 1024;

export type RunBunResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
  /** True when the process was killed due to timeout. */
  exitedDueToTimeout?: boolean;
};

/**
 * Run a command with Bun.spawn in the given cwd. Reads stdout/stderr via .text(), enforces timeout, truncates output.
 */
export async function runBun(
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
      ? s.slice(0, maxOutputBytes) + "\n...[truncated]"
      : s;
  return {
    stdout: truncate(stdout),
    stderr: truncate(stderr),
    exitCode,
    ...(exitedDueToTimeout && { exitedDueToTimeout: true }),
  };
}

/** The subdirectory within workspace where AI has file operation access. */
export const WS_SUBDIR = "ws";

/** Message returned when AI tries to access files outside the allowed directory. */
export const WS_PATH_RESTRICTION_MESSAGE =
  "路径无效或尝试访问受保护区域。工作区的配置文件（如 package.json、.env）受保护，无法通过工具访问。";

/**
 * Resolve a path relative to the workspace ws/ directory.
 * AI passes paths like "a.js" or "scripts/foo.js"; they are automatically resolved under workspace/ws/.
 * Throws if the result tries to escape the ws/ directory.
 */
export function getWorkspaceAbsolutePath(relativePath: string): string {
  const wsBase = getWsAbsolutePath();
  const resolved = resolve(wsBase, relativePath);
  const rel = relative(wsBase, resolved);
  if (rel.startsWith("..")) {
    throw new Error(WS_PATH_RESTRICTION_MESSAGE);
  }
  return resolved;
}

/**
 * Get the absolute path to the workspace working directory.
 */
export function getWsAbsolutePath(): string {
  return resolve(DIR_WORKSPACE, WS_SUBDIR);
}

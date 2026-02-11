import { relative, resolve } from "node:path";
import { DIR_WORKSPACE } from "./defines";

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

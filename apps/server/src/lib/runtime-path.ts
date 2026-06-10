import path from "node:path";
import { DIR_RUNTIME } from "../jarvis/defines";

export const PATH_DESC =
  "File or directory path. Prefer runtime-relative paths (e.g. tmp/foo.txt, notes/user.md). Absolute paths are also accepted.";

export const CWD_DESC =
  "Working directory. Prefer runtime-relative (e.g. tmp/my-project). Omit to use the runtime root.";

export function isUnderRuntime(resolvedPath: string): boolean {
  const normalized = path.resolve(resolvedPath);
  const runtimeRoot = path.resolve(DIR_RUNTIME);
  const rel = path.relative(runtimeRoot, normalized);
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}

/** Resolve a path relative to runtime, or normalize an absolute path. */
export function resolveRuntimePath(inputPath: string): string {
  const trimmed = inputPath.trim();
  if (!trimmed) {
    throw new Error("Path is empty");
  }

  const resolved = path.isAbsolute(trimmed)
    ? path.resolve(trimmed)
    : path.resolve(DIR_RUNTIME, trimmed);

  if (!path.isAbsolute(trimmed) && !isUnderRuntime(resolved)) {
    throw new Error(`Path escapes runtime directory: ${inputPath}`);
  }

  return resolved;
}

/** Prefer runtime-relative paths (forward slashes) for agent-facing output and URLs. */
export function toDisplayPath(resolvedPath: string): string {
  const normalized = path.resolve(resolvedPath);
  if (isUnderRuntime(normalized)) {
    const rel = path.relative(path.resolve(DIR_RUNTIME), normalized);
    if (rel === "") return ".";
    return rel.split(path.sep).join("/");
  }
  return normalized;
}

/** Build a `/jarvis/file` query path, preferring runtime-relative form. */
export function toJarvisFileUrlPath(resolvedPath: string): string {
  return toDisplayPath(resolvedPath);
}

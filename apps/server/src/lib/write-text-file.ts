import path from "node:path";
import fs from "fs-extra";
import { resolveRuntimePath, toDisplayPath } from "./runtime-path";

const TEXT_EXTENSIONS = new Set([
  ".html",
  ".htm",
  ".css",
  ".js",
  ".mjs",
  ".json",
  ".md",
  ".txt",
  ".svg",
  ".xml",
  ".csv",
  ".ts",
  ".tsx",
  ".jsx",
  ".yaml",
  ".yml",
]);

export const MAX_TEXT_FILE_BYTES = 2 * 1024 * 1024;

export function writeTextFile(filePath: string, content: string) {
  const resolvedPath = resolveRuntimePath(filePath);
  const ext = path.extname(resolvedPath).toLowerCase();
  if (!TEXT_EXTENSIONS.has(ext)) {
    throw new Error(
      `Only text files are allowed (got "${ext || "no extension"}")`,
    );
  }

  const bytes = Buffer.byteLength(content, "utf-8");
  if (bytes > MAX_TEXT_FILE_BYTES) {
    throw new Error(
      `Content too large (${bytes} bytes, max ${MAX_TEXT_FILE_BYTES})`,
    );
  }

  fs.outputFileSync(resolvedPath, content, "utf-8");
  return { ok: true as const, path: toDisplayPath(resolvedPath), bytes };
}

import path from "node:path";
import fs from "fs-extra";
import { autoRenameWithIndex } from "./string";

type ResolveSafeFilenameOptions = {
  /** Extension without leading dot; overrides the extension from `filename`. */
  ext?: string;
};

/**
 * Returns a collision-safe full path under `dir` for the requested `filename`.
 * Reads existing entries in `dir`, keeps the same extension family, and applies
 * indexed renames such as `cat(1).png` when needed.
 */
export async function resolveSafeFilename(
  dir: string,
  filename: string,
  options?: ResolveSafeFilenameOptions,
): Promise<string> {
  const base = path.basename(filename);
  const parsed = path.parse(base);
  if (!parsed.name) {
    throw new Error(`Invalid filename: ${filename}`);
  }

  const extWithDot = options?.ext
    ? `.${options.ext.replace(/^\./, "")}`
    : parsed.ext;
  const requestedName = parsed.name;

  let existing: string[] = [];
  if (await fs.pathExists(dir)) {
    existing = await fs.readdir(dir);
  }

  const safeBase = autoRenameWithIndex(
    requestedName,
    existing
      .filter((entry) => path.extname(entry) === extWithDot)
      .map((entry) => path.parse(entry).name),
  );

  return path.join(dir, `${safeBase}${extWithDot}`);
}

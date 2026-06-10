import path, { join } from "node:path";
import fs from "fs-extra";
import { resolveSafeFilename } from "../lib/file";
import { toDisplayPath } from "../lib/runtime-path";
import { DIR_SESSIONS, DIR_TMP } from "./defines";

export default class JarvisUpload {
  async upload(file: File, sessionId?: string) {
    const dir = sessionId
      ? join(DIR_SESSIONS, sessionId, "attachments")
      : DIR_TMP;
    await fs.ensureDir(dir);
    const newPath = await resolveSafeFilename(dir, file.name);
    const newName = path.parse(path.basename(newPath)).name;
    await Bun.write(newPath, file);
    return {
      type: "local-file",
      originalName: file.name,
      uploadName: newName,
      uploadPath: toDisplayPath(newPath),
      fileType: file.type,
      fileSize: file.size,
    };
  }
}

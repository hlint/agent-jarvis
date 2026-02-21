import path from "node:path";
import type { AttachmentEntry } from "@repo/shared/defines/jarvis";
import { timeFormat } from "@repo/shared/lib/time";
import { shortId } from "@repo/shared/lib/utils";
import fs from "fs-extra";
import mime from "mime-types";
import { z } from "zod";
import { DIR_RUNTIME } from "../defines";
import { defineJarvisTool } from "../tool";

const PATH_DESC = "Path (relative to runtime if not absolute)";

function resolvePath(inputPath: string): string {
  return path.isAbsolute(inputPath)
    ? inputPath
    : path.join(path.resolve(DIR_RUNTIME), inputPath);
}

const attachmentTool = defineJarvisTool({
  name: "attachment",
  description:
    "Display a file or URL as attachment to the user in the chat. Use when you want to show the user a generated file (e.g. image, chart) or a remote resource (e.g. image URL).",
  inputSchema: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("local-file"),
      path: z.string().describe(PATH_DESC),
    }),
    z.object({
      type: z.literal("remote-url"),
      url: z.string().url().describe("Remote URL to display (e.g. image link)"),
    }),
  ]),
  execute: async (input, jarvis) => {
    const id = shortId();
    const createdTime = timeFormat();

    if (input.type === "local-file") {
      const resolvedPath = resolvePath(input.path);
      if (!(await fs.pathExists(resolvedPath))) {
        throw new Error(`File not found: ${resolvedPath}`);
      }
      const stat = await fs.stat(resolvedPath);
      if (!stat.isFile()) {
        throw new Error(`Not a file: ${resolvedPath}`);
      }
      const originalName = path.basename(resolvedPath);
      const fileType = mime.lookup(resolvedPath) || "application/octet-stream";

      const entry: AttachmentEntry = {
        id,
        role: "attachment",
        from: "assistant",
        channel: "tool-call",
        createdTime,
        data: {
          type: "local-file",
          originalName,
          fileType,
          fileSize: stat.size,
          filePath: resolvedPath,
        },
      };
      jarvis.pushHistoryEntry(entry);
      return { success: true, id };
    }

    // remote-url
    const entry: AttachmentEntry = {
      id,
      role: "attachment",
      from: "assistant",
      channel: "tool-call",
      createdTime,
      data: {
        type: "remote-url",
        url: input.url,
      },
    };
    jarvis.pushHistoryEntry(entry);
    return { success: true, id };
  },
});

export default attachmentTool;

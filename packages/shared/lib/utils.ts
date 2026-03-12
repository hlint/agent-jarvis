import { nanoid } from "nanoid";
import type { AttachmentEntry } from "../defines/jarvis";

export function shortId(): string {
  return nanoid(6);
}

export function getAttachmentEntryDisplayText(entry: AttachmentEntry): string {
  const { data } = entry;
  const isRemoteUrl = "url" in data;
  const displayName =
    ("originalName" in data ? data.originalName : undefined) ??
    (isRemoteUrl
      ? (() => {
          try {
            return (
              new URL((data as { url: string }).url).pathname
                .split("/")
                .pop() ?? "Link"
            );
          } catch {
            return "Link";
          }
        })()
      : "File");
  return displayName;
}

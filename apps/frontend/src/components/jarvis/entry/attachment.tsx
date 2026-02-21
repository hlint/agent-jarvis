import type { AttachmentEntry } from "@repo/shared/defines/jarvis";
import { DownloadIcon, FileIcon } from "lucide-react";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileUrl(path: string): string {
  return `/jarvis/file?path=${encodeURIComponent(path)}`;
}

export default function JarvisAttachmentEntry(entry: AttachmentEntry) {
  const { data, from } = entry;
  if (!data?.path) return null;

  const isImage = data.type?.startsWith("image/");
  const isAudio =
    data.type?.startsWith("audio/") || data.originalName === "voice.webm";
  const isVideo = data.type?.startsWith("video/");
  const fileUrl = getFileUrl(data.path);
  const isUser = from === "user";

  const downloadLinkClass = `text-xs text-muted-foreground truncate hover:underline ${isUser ? "text-right" : "text-left"}`;

  if (isImage) {
    return (
      <div
        className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
      >
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl overflow-hidden border max-w-sm hover:opacity-90 transition-opacity"
        >
          <img
            src={fileUrl}
            alt={data.originalName ?? "Image"}
            className="max-h-64 object-contain block"
          />
        </a>
        <a
          href={fileUrl}
          download={data.originalName}
          className={downloadLinkClass}
        >
          {data.originalName ?? "Image"}
        </a>
      </div>
    );
  }

  if (isAudio) {
    return (
      <div
        className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
      >
        <audio src={fileUrl} controls preload="metadata" className="max-w-sm ">
          <track kind="captions" />
        </audio>
        <a
          href={fileUrl}
          download={data.originalName}
          className={downloadLinkClass}
        >
          {data.originalName ?? "Audio"}
        </a>
      </div>
    );
  }

  if (isVideo) {
    return (
      <div
        className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
      >
        <video
          src={fileUrl}
          controls
          className="max-h-80 max-w-sm rounded-xl border"
          preload="metadata"
        >
          <track kind="captions" />
        </video>
        <a
          href={fileUrl}
          download={data.originalName}
          className={`${downloadLinkClass} max-w-sm block`}
        >
          {data.originalName ?? "Video"}
        </a>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="flex flex-row gap-2 items-center bg-background border p-3 rounded-xl max-w-md">
        <FileIcon className="size-6 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium truncate block text-inherit underline"
            title="Preview"
          >
            {data.originalName ?? "File"}
          </a>
          {data.size != null && (
            <p className="text-xs text-muted-foreground">
              {formatFileSize(data.size)}
            </p>
          )}
        </div>
        <a
          href={fileUrl}
          download={data.originalName}
          className="shrink-0 p-2 rounded-md hover:bg-muted transition-colors"
          title="Download"
        >
          <DownloadIcon className="size-4 text-muted-foreground" />
        </a>
      </div>
    </div>
  );
}

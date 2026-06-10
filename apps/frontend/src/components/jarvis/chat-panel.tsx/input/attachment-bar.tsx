import { XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import useJarvisStore from "../../hooks/use-jarvis-store";
import type { AttachmentUploadItem } from "../../lib/attachment-types";
import { removeAttachment } from "../../lib/upload-file";

export default function AttachmentBar() {
  const attachments = useJarvisStore((s) => s.attachments);
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pb-1.5">
      {attachments.map((item) => (
        <AttachmentBadge
          key={item.id}
          item={item}
          onRemove={() => removeAttachment(item.id)}
        />
      ))}
    </div>
  );
}

function AttachmentBadge({
  item,
  onRemove,
}: {
  item: AttachmentUploadItem;
  onRemove: () => void;
}) {
  const progress =
    item.status === "done"
      ? 100
      : item.status === "error" || item.status === "cancelled"
        ? 0
        : item.progress;

  return (
    <Badge
      variant={item.status === "error" ? "destructive" : "secondary"}
      title={item.error ?? item.originalName}
      className={cn(
        "relative h-8 max-w-64 gap-1.5 px-3 py-1 text-xs pr-1.5 overflow-hidden",
        item.status === "uploading" && "animate-pulse",
      )}
    >
      <span
        className={cn(
          "absolute inset-y-0 left-0 transition-[width] duration-150",
          item.status === "error" ? "bg-destructive/20 w-0" : "bg-primary/35",
        )}
        style={{ width: `${progress}%` }}
      />
      <span className="relative z-10 truncate">{item.originalName}</span>
      <button
        type="button"
        className="relative z-10 rounded-full p-1 hover:bg-foreground/10 cursor-pointer text-muted-foreground hover:text-foreground"
        title={`Remove ${item.originalName}`}
        onClick={onRemove}
      >
        <XIcon className="size-3.5" />
      </button>
    </Badge>
  );
}

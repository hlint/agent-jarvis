import { FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PathChip({
  path,
  className,
}: {
  path: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-1 rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 font-mono text-xs text-foreground",
        className,
      )}
    >
      <FileIcon className="size-3 shrink-0 opacity-60" aria-hidden />
      <span className="truncate">{path}</span>
    </span>
  );
}

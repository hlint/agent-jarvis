import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { enqueueFiles } from "../../lib/upload-file";

export default function InputBox({ children }: { children: React.ReactNode }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files: File[] = [];
    const items = e.dataTransfer.items;
    if (items?.length) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item) continue;
        const entry =
          item.webkitGetAsEntry?.() ??
          (
            item as { getAsEntry?: () => FileSystemEntry | null }
          ).getAsEntry?.();
        if (entry?.isDirectory) {
          toast.error("Folders are not allowed.");
          return;
        }
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    } else {
      for (const file of e.dataTransfer.files) {
        files.push(file);
      }
    }

    if (files.length > 0) enqueueFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    const related = e.relatedTarget;
    if (
      !related ||
      !(related instanceof Node) ||
      !e.currentTarget.contains(related)
    ) {
      setIsDragging(false);
    }
  };
  return (
    <div
      role="region"
      aria-label="Upload area"
      className={cn(
        "relative p-2 space-y-1 border flex flex-col border-border/60 rounded-xl overflow-hidden transition-colors focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/15 bg-card min-h-8",
        isDragging &&
          "border-primary ring-2 ring-primary/20 bg-sidebar-primary-foreground",
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {children}
    </div>
  );
}

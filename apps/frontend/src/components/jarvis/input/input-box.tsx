import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import uploadFile from "../lib/upload-file";

export default function InputBox({ children }: { children: React.ReactNode }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    if (items?.length) {
      const entry =
        items[0].webkitGetAsEntry?.() ??
        (
          items[0] as { getAsEntry?: () => FileSystemEntry | null }
        ).getAsEntry?.();
      if (entry?.isDirectory) {
        toast.error("Folders are not allowed. Please drop a single file.");
        return;
      }
      if (items.length > 1) {
        toast.error("Only one file at a time.");
        return;
      }
    }

    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
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
        "relative h-[180px] border flex flex-col border-foreground/10 rounded-xl overflow-hiddentransition-colors focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/15 bg-neutral-900",
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

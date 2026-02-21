import { useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Textarea } from "../../ui/textarea";
import InputToolbar from "./toolbar";

export default function JarvisInput() {
  const [content, setContent] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (content.trim() === "") return;
    api.jarvis["user-message"].post({ content });
    setContent("");
  };

  const processFile = async (file: File) => {
    if (isUploading) return;
    setIsUploading(true);
    const uploadFn = async () => {
      const result = await api.jarvis.upload.post({ file });
      if (!result.data?.success) {
        throw new Error(
          (result.data as { error?: string })?.error ?? "Upload failed",
        );
      }
      return file.name;
    };
    try {
      toast.promise(uploadFn(), {
        loading: "Uploading...",
        success: (name) => `Uploaded: ${name}`,
        error: (err) => err.message,
      });
    } finally {
      setIsUploading(false);
    }
  };

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
    if (file) processFile(file);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  return (
    <div className="sticky bottom-0 z-10 from-transparent to-background bg-linear-to-b lg:pb-6">
      <div className="h-20 from-transparent to-background bg-linear-to-b" />
      <div className="h-4 bg-background" />
      <div
        role="region"
        aria-label="Upload area"
        className={`relative border border-foreground/10 rounded-xl overflow-hidden bg-background transition-colors focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/15 ${isDragging ? "border-primary ring-2 ring-primary/20" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Textarea
          placeholder="Ask me anything"
          className="p-4 w-full h-32 md:text-sm bg-transparent rounded-none border-none focus-visible:ring-0 focus-visible:ring-offset-0"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <InputToolbar
          onSend={handleSend}
          onUploadClick={() => fileInputRef.current?.click()}
          onFileReady={processFile}
          isUploading={isUploading}
        />
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept="*/*"
        />
      </div>
    </div>
  );
}

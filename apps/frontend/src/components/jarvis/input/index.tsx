import { useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { uploadFile } from "@/lib/upload";
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
    const result = await uploadFile(file);
    setIsUploading(false);
    if (result.success) {
      toast.success(`Uploaded: ${result.filename}`);
    } else {
      toast.error(result.error);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
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
    <div className="sticky bottom-0 z-10 from-transparent to-gray-50 bg-linear-to-b p-3 lg:pb-6">
      <div className="h-24 from-transparent to-gray-50 bg-linear-to-b" />
      <div
        role="region"
        aria-label="Upload area"
        className={`relative p-2 border rounded-lg bg-background transition-colors ${isDragging ? "border-primary ring-2 ring-primary/20" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Textarea
          placeholder="Ask me anything"
          className="w-full h-32 md:text-sm bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
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

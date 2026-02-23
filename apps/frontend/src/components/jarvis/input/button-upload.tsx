import { Loader2Icon, PaperclipIcon } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import uploadFile from "../lib/upload-file";
import useJarvisStore from "../use-jarvis-store";

export default function ButtonUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUploading = useJarvisStore((s) => s.isUploading);
  return (
    <>
      <Button
        variant="ghost"
        size="icon-lg"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        title="Upload file"
      >
        {isUploading ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <PaperclipIcon />
        )}
      </Button>
      <input
        type="file"
        hidden
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={() => {
          const file = fileInputRef.current?.files?.[0];
          if (file) uploadFile(file);
        }}
      />
    </>
  );
}

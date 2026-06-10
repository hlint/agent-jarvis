import { Loader2Icon, PaperclipIcon } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import useJarvisStore from "../../hooks/use-jarvis-store";
import { enqueueFiles } from "../../lib/upload-file";

export default function ButtonUpload() {
  const isUploading = useJarvisStore((s) =>
    s.attachments.some(
      (a) => a.status === "uploading" || a.status === "queued",
    ),
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <Button
        variant="ghost"
        size="icon-lg"
        onClick={() => fileInputRef.current?.click()}
        title="Attach files"
      >
        {isUploading ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <PaperclipIcon />
        )}
      </Button>
      <input
        type="file"
        multiple
        hidden
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length > 0) enqueueFiles(files);
          e.target.value = "";
        }}
      />
    </>
  );
}

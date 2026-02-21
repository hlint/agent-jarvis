import {
  Loader2Icon,
  MicIcon,
  PaperclipIcon,
  SendIcon,
  SquareIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import ClearHistoryButton from "./clear-history-button";
import DebugModeSwitch from "./debug-mode-switch";

export default function InputToolbar({
  onSend,
  onUploadClick,
  onFileReady,
  isUploading = false,
}: {
  onSend: () => void;
  onUploadClick?: () => void;
  onFileReady?: (file: File) => void;
  isUploading?: boolean;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleMicClick = async () => {
    if (isUploading) return;

    if (isRecording) {
      mediaRecorderRef.current?.stop();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => {
          t.stop();
        });
        setIsRecording(false);
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const ext = mimeType.includes("webm") ? ".webm" : ".mp4";
        const file = new File([blob], `voice${ext}`, {
          type: mimeType,
        });
        onFileReady?.(file);
        mediaRecorderRef.current = null;
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Microphone access denied",
      );
    }
  };

  return (
    <div className="flex flex-row gap-2 items-center p-2 bg-foreground/10">
      <Button
        variant="ghost"
        size="icon-lg"
        onClick={onUploadClick}
        disabled={isUploading || isRecording}
        title="Upload file"
      >
        {isUploading ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <PaperclipIcon />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon-lg"
        onClick={handleMicClick}
        disabled={isUploading}
        title={isRecording ? "Stop recording" : "Record audio"}
        className={isRecording ? "text-destructive" : undefined}
      >
        {isRecording ? (
          <SquareIcon className="size-4 fill-current" />
        ) : (
          <MicIcon />
        )}
      </Button>
      <ClearHistoryButton />
      <DebugModeSwitch />
      <StateIndicator />
      <Button
        variant="outline"
        className="ml-auto dark:bg-primary/60 dark:hover:bg-primary/70"
        size="lg"
        onClick={onSend}
      >
        <SendIcon />
        Send
      </Button>
    </div>
  );
}

function StateIndicator() {
  return null;
}

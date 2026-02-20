import { Loader2Icon, MicIcon, PaperclipIcon, SendIcon } from "lucide-react";
import { Button } from "../../ui/button";
import ClearHistoryButton from "./clear-history-button";
import DebugModeSwitch from "./debug-mode-switch";

export default function InputToolbar({
  onSend,
  onUploadClick,
  isUploading = false,
}: {
  onSend: () => void;
  onUploadClick?: () => void;
  isUploading?: boolean;
}) {
  return (
    <div className="flex flex-row gap-2 items-center">
      <Button
        variant="ghost"
        size="icon-lg"
        onClick={onUploadClick}
        disabled={isUploading}
        title="Upload file"
      >
        {isUploading ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <PaperclipIcon />
        )}
      </Button>
      <Button variant="ghost" size="icon-lg">
        <MicIcon />
      </Button>
      <ClearHistoryButton />
      <DebugModeSwitch />
      <StateIndicator />
      <Button variant="ghost" className="ml-auto" size="lg" onClick={onSend}>
        <SendIcon />
        Send
      </Button>
    </div>
  );
}

function StateIndicator() {
  return null;
}

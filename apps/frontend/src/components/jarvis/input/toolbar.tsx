import { MicIcon, SendIcon } from "lucide-react";
import { Button } from "../../ui/button";
import ClearHistoryButton from "./clear-history-button";
import DebugModeSwitch from "./debug-mode-switch";

export default function InputToolbar({ onSend }: { onSend: () => void }) {
  return (
    <div className="flex flex-row gap-2 items-center">
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

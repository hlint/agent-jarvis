import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useJarvisStore from "../../hooks/use-jarvis-store";
import { canSendUserMessage } from "../../lib/attachment-types";
import { focusChatInput } from "./chat-input-id";

export default function ButtonSend() {
  const status = useJarvisStore((state) => state.currentSession?.status);
  const sendUserMessage = useJarvisStore((s) => s.sendUserMessage);
  const abortSession = useJarvisStore((s) => s.abortSession);
  const setInputMode = useJarvisStore((s) => s.setInputMode);
  const canSend = useJarvisStore((s) => canSendUserMessage(s));
  if (status === "running")
    return (
      <Button
        type="button"
        variant="secondary"
        className="ml-auto"
        onClick={() => {
          void abortSession();
        }}
      >
        <Loader2Icon className="size-4 animate-spin" />
        <span>Abort</span>
      </Button>
    );
  if (status === "stopping")
    return (
      <Button
        type="button"
        variant="destructive"
        disabled
        className="ml-auto"
        onClick={() => {
          // abort execution
        }}
      >
        <Loader2Icon className="size-4 animate-spin" />
        <span>Aborting...</span>
      </Button>
    );
  return (
    <Button
      type="button"
      variant="default"
      className={cn("group ml-auto")}
      onClick={() => {
        if (canSend) {
          sendUserMessage();
        } else {
          focusChatInput(setInputMode);
        }
      }}
    >
      Send
    </Button>
  );
}

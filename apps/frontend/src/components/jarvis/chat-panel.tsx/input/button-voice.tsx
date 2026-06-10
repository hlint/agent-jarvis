import { MicIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import useJarvisStore from "../../hooks/use-jarvis-store";

const VOICE_UNAVAILABLE_MESSAGE =
  "Voice input is unavailable. Configure a provider with the VOICE_RECOGNITION duty in config.json.";

export default function ButtonVoice() {
  const setInputMode = useJarvisStore((s) => s.setInputMode);
  const isVoiceServiceAvailable = useJarvisStore(
    (s) => s.isVoiceServiceAvailable,
  );

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      title="Voice"
      onClick={() => {
        if (!isVoiceServiceAvailable) {
          toast.error(VOICE_UNAVAILABLE_MESSAGE);
          return;
        }
        setInputMode("voice");
      }}
    >
      <MicIcon />
    </Button>
  );
}

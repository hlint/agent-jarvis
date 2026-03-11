import { MicIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import useJarvisStore from "../use-jarvis-store";

export default function ButtonVoice() {
  const setInputMode = useJarvisStore((s) => s.setInputMode);
  return (
    <Button
      variant="ghost"
      size="icon-lg"
      title="Voice"
      onClick={() => setInputMode("voice")}
    >
      <MicIcon />
    </Button>
  );
}

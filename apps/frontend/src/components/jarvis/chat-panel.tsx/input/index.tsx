import { cn } from "@/lib/utils";
import useJarvisStore from "../../hooks/use-jarvis-store";
import InputBox from "./input-box";
import TextMode from "./text-mode";
import VoiceMode from "./voice-mode";

export default function JarvisInput() {
  const inputMode = useJarvisStore((s) => s.inputMode);
  const isConnected = useJarvisStore((s) => s.isConnected);
  return (
    <div className={cn(!isConnected && "pointer-events-none opacity-60")}>
      <InputBox>{inputMode === "text" ? <TextMode /> : <VoiceMode />}</InputBox>
    </div>
  );
}

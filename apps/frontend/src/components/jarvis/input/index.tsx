import { cn } from "@/lib/utils";
import useJarvisStore from "../use-jarvis-store";
import InputBox from "./input-box";
import TextMode from "./text-mode";
import VoiceMode from "./voice-mode";

export default function JarvisInput() {
  const inputMode = useJarvisStore((s) => s.inputMode);
  const isConnected = useJarvisStore((s) => s.isConnected);
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 from-transparent to-background bg-linear-to-b px-3 py-5",
        !isConnected && "pointer-events-none",
      )}
    >
      <div className="h-12 from-transparent to-background bg-linear-to-b" />
      <div className="h-4 bg-background" />
      <InputBox>{inputMode === "text" ? <TextMode /> : <VoiceMode />}</InputBox>
    </div>
  );
}

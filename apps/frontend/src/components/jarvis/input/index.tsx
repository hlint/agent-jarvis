import useJarvisStore from "../use-jarvis-store";
import InputBox from "./input-box";
import TextMode from "./text-mode";
import VoiceMode from "./voice-mode";

export default function JarvisInput() {
  const inputMode = useJarvisStore((s) => s.inputMode);
  return (
    <div className="sticky bottom-0 z-10 from-transparent to-background bg-linear-to-b lg:pb-6">
      <div className="h-20 from-transparent to-background bg-linear-to-b" />
      <div className="h-4 bg-background" />
      <InputBox>{inputMode === "text" ? <TextMode /> : <VoiceMode />}</InputBox>
    </div>
  );
}

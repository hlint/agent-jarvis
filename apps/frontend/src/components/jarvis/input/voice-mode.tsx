import { CircleXIcon } from "lucide-react";
import { useVoiceVisualizer, VoiceVisualizer } from "react-voice-visualizer";
import { Button } from "@/components/ui/button";
import useJarvisStore from "../use-jarvis-store";

export default function VoiceMode() {
  const setInputMode = useJarvisStore((s) => s.setInputMode);
  return (
    <>
      {/* 波形图 */}
      <div className="flex-1"></div>
      {/* 控制区 */}
      <div className="flex flex-row gap-1.5 items-center justify-center p-2 ">
        <Button
          variant="ghost"
          size="icon-lg"
          title="Stop"
          onClick={() => setInputMode("text")}
        >
          <CircleXIcon />
        </Button>
      </div>
    </>
  );
}

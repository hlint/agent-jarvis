import { MicIcon, PauseIcon, XIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { useVoiceVisualizer, VoiceVisualizer } from "react-voice-visualizer";
import { Button } from "@/components/ui/button";
import uploadFile from "../lib/upload-file";
import useJarvisStore from "../use-jarvis-store";
import ButtonSend from "./button-send";

export default function VoiceMode() {
  const setInputMode = useJarvisStore((s) => s.setInputMode);
  const recorderControls = useVoiceVisualizer({
    shouldHandleBeforeUnload: false,
  });

  const {
    startRecording,
    stopRecording,
    togglePauseResume,
    clearCanvas,
    isRecordingInProgress,
    isPausedRecording,
    recordedBlob,
    isAvailableRecordedAudio,
    error,
  } = recorderControls;

  const refStart = useRef(startRecording);

  // Auto-start recording when component mounts
  useEffect(() => {
    refStart.current();
  }, []);

  // Error handling
  useEffect(() => {
    if (error) {
      console.error("[VoiceMode] Recording error:", error);
    }
  }, [error]);

  // Listen for recorded data
  useEffect(() => {
    if (recordedBlob && isAvailableRecordedAudio) {
      setInputMode("text");
      // 'audio/webm' or 'audio/webm;codecs=opus' — semicolon and after is optional
      const ext = recordedBlob.type.match(/^[^/]+\/([^;/]+)/)?.[1] ?? "webm";
      const file = new File([recordedBlob], `voice.${ext}`, {
        type: recordedBlob.type,
      });
      uploadFile(file);
    }
  }, [recordedBlob, isAvailableRecordedAudio, setInputMode]);

  const handleBack = () => {
    stopRecording();
    clearCanvas();
    setInputMode("text");
  };

  const handleSend = () => {
    stopRecording();
  };

  return (
    <>
      {/* Waveform */}
      <div className="min-h-0 p-2">
        <VoiceVisualizer
          controls={recorderControls}
          isControlPanelShown={false}
          isDefaultUIShown={false}
          isDownloadAudioButtonShown={false}
          mainBarColor="#bbbbbb"
          secondaryBarColor="#666666"
          height={60}
          barWidth={2}
          gap={1}
        />
      </div>

      {/* Control area */}
      <div className="flex flex-row gap-1.5 items-center justify-center p-1 shrink-0">
        {/* Back: discard recording, return to text mode */}
        <Button variant="secondary" onClick={handleBack}>
          <XIcon />
          Cancel
        </Button>

        {/* Pause/Resume */}
        {isRecordingInProgress && (
          <Button
            variant={isPausedRecording ? "secondary" : "destructive"}
            onClick={togglePauseResume}
          >
            {isPausedRecording ? <MicIcon /> : <PauseIcon />}
            {isPausedRecording ? "Record" : "Pause"}
          </Button>
        )}

        {/* Send: stop recording and upload */}
        <ButtonSend onClick={handleSend} />
      </div>
    </>
  );
}

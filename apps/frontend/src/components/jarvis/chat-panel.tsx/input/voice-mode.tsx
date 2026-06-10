import { Loader2Icon, MicIcon, PauseIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useVoiceVisualizer, VoiceVisualizer } from "react-voice-visualizer";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCssVariable } from "@/lib/use-css-variable";
import { cn } from "@/lib/utils";
import useJarvisStore from "../../hooks/use-jarvis-store";
import speechToText from "../../lib/speech-to-text";

export default function VoiceMode() {
  const setInputMode = useJarvisStore((s) => s.setInputMode);
  const setInputText = useJarvisStore((s) => s.setInputText);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mainBarColor = useCssVariable("--muted-foreground", "#bbbbbb");
  const secondaryBarColor = useCssVariable("--border", "#666666");
  const transcribeStartedRef = useRef(false);
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
    error,
  } = recorderControls;

  const refStart = useRef(startRecording);

  useEffect(() => {
    refStart.current();
  }, []);

  useEffect(() => {
    if (error) {
      console.error("[VoiceMode] Recording error:", error);
    }
  }, [error]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once per save; avoid unstable recorder control refs
  useEffect(() => {
    if (!isTranscribing || !recordedBlob) return;
    if (transcribeStartedRef.current) return;

    transcribeStartedRef.current = true;

    const ext = recordedBlob.type.match(/^[^/]+\/([^;/]+)/)?.[1] ?? "webm";
    const file = new File([recordedBlob], `voice.${ext}`, {
      type: recordedBlob.type,
    });

    speechToText(file)
      .then((text) => {
        setInputText(text);
        setInputMode("text");
      })
      .catch((err: unknown) => {
        toast.error(
          err instanceof Error ? err.message : "Speech-to-text failed",
        );
        setIsTranscribing(false);
      })
      .finally(() => {
        transcribeStartedRef.current = false;
      });
  }, [isTranscribing, recordedBlob]);

  const handleBack = () => {
    transcribeStartedRef.current = false;
    setIsTranscribing(false);
    stopRecording();
    clearCanvas();
    setInputMode("text");
  };

  const handleSave = () => {
    if (isTranscribing || transcribeStartedRef.current) return;
    stopRecording();
    setIsTranscribing(true);
  };

  return (
    <>
      {/* Keep mounted so the library can finalize recordedBlob after stop */}
      <div
        className={cn(
          "min-h-0 p-2",
          isTranscribing &&
            "pointer-events-none fixed top-0 -left-[9999px] h-[60px] w-px opacity-0",
        )}
        aria-hidden={isTranscribing}
      >
        <VoiceVisualizer
          controls={recorderControls}
          isControlPanelShown={false}
          isDefaultUIShown={false}
          isDownloadAudioButtonShown={false}
          mainBarColor={mainBarColor}
          secondaryBarColor={secondaryBarColor}
          height={60}
          barWidth={2}
          gap={1}
        />
      </div>

      {isTranscribing ? (
        <div className="flex min-h-27 flex-col items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
          <Loader2Icon className="size-5 animate-spin" />
          Transcribing...
        </div>
      ) : (
        <div className="flex min-h-10 flex-row items-center justify-center gap-1.5 p-1 shrink-0">
          <Button variant="secondary" onClick={handleBack}>
            <XIcon />
            Cancel
          </Button>

          {isRecordingInProgress && (
            <Button
              variant={isPausedRecording ? "secondary" : "destructive"}
              onClick={togglePauseResume}
            >
              {isPausedRecording ? <MicIcon /> : <PauseIcon />}
              {isPausedRecording ? "Record" : "Pause"}
            </Button>
          )}

          <Button
            type="button"
            variant="default"
            className="ml-auto"
            onClick={handleSave}
          >
            <MicIcon className="size-4" />
            Save
          </Button>
        </div>
      )}
    </>
  );
}

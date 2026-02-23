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

  // 组件加载时自动开始录音
  useEffect(() => {
    refStart.current();
  }, []);

  // 错误处理
  useEffect(() => {
    if (error) {
      console.error("[VoiceMode] Recording error:", error);
    }
  }, [error]);

  // 监听录音数据生成
  useEffect(() => {
    if (recordedBlob && isAvailableRecordedAudio) {
      setInputMode("text");
      // 'audio/webm' or 'audio/webm;codecs=opus' — 分号及之后可选
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
      {/* 波形图 */}
      <div className="flex-1 min-h-0 p-2">
        <VoiceVisualizer
          controls={recorderControls}
          isControlPanelShown={false}
          isDefaultUIShown={false}
          isDownloadAudioButtonShown={false}
          mainBarColor="#bbbbbb"
          secondaryBarColor="#666666"
          height={120}
          barWidth={2}
          gap={1}
        />
      </div>

      {/* 控制区 */}
      <div className="flex flex-row gap-1.5 items-center justify-center p-2 shrink-0">
        {/* 返回：放弃录音，回到文字模式 */}
        <Button variant="secondary" onClick={handleBack}>
          <XIcon />
          Cancel
        </Button>

        {/* 暂停/继续 */}
        {isRecordingInProgress && (
          <Button
            variant={isPausedRecording ? "secondary" : "destructive"}
            onClick={togglePauseResume}
          >
            {isPausedRecording ? <MicIcon /> : <PauseIcon />}
            {isPausedRecording ? "Record" : "Pause"}
          </Button>
        )}

        {/* 发送：打印到控制台，清空缓冲区，暂停录音 */}
        <ButtonSend onClick={handleSend} />
      </div>
    </>
  );
}

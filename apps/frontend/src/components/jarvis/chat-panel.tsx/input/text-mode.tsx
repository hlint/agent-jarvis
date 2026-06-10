import { Textarea } from "@/components/ui/textarea";
import useJarvisStore from "../../hooks/use-jarvis-store";
import { canSendUserMessage } from "../../lib/attachment-types";
import AttachmentBar from "./attachment-bar";
import { JARVIS_CHAT_INPUT_ID } from "./chat-input-id";
import InputToolbar from "./toolbar";

export default function TextMode() {
  const inputText = useJarvisStore((s) => s.inputText);
  const setInputText = useJarvisStore((s) => s.setInputText);
  const sendUserMessage = useJarvisStore((s) => s.sendUserMessage);
  const isConnected = useJarvisStore((s) => s.isConnected);
  const canSend = useJarvisStore((s) => canSendUserMessage(s));
  return (
    <>
      <AttachmentBar />
      <Textarea
        id={JARVIS_CHAT_INPUT_ID}
        placeholder={isConnected ? "Ask Jarvis" : "Connecting..."}
        autoFocus
        className="w-full md:text-sm bg-transparent dark:bg-transparent rounded-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-1 min-h-0 h-10 overflow-auto"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && canSend) {
            e.preventDefault();
            sendUserMessage();
          }
        }}
      />
      <InputToolbar />
    </>
  );
}

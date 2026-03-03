import { Textarea } from "@/components/ui/textarea";
import useJarvisStore from "../use-jarvis-store";
import InputToolbar from "./toolbar";

export default function TextMode() {
  const inputText = useJarvisStore((s) => s.inputText);
  const setInputText = useJarvisStore((s) => s.setInputText);
  const sendMessage = useJarvisStore((s) => s.sendMessage);
  return (
    <>
      <Textarea
        placeholder="Ask Jarvis"
        autoFocus
        className="w-full md:text-sm dark:bg-transparent rounded-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-1 min-h-0 h-10 overflow-auto"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        }}
      />
      <InputToolbar />
    </>
  );
}

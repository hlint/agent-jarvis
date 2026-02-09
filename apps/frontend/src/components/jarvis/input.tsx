import { MicIcon, SendIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

export default function JarvisInput() {
  const [content, setContent] = useState("");
  const handleSend = () => {
    if (content.trim() === "") return;
    api.jarvis["user-message"].post({ content });
    setContent("");
  };
  return (
    <div className="sticky bottom-0 z-10 from-transparent to-background bg-linear-to-b">
      <div className="h-24 from-transparent to-background bg-linear-to-b" />
      <div className="p-2 border rounded-lg shadow-lg bg-background">
        <Textarea
          placeholder="Ask me anything"
          className="w-full h-32 md:text-sm bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <div className="flex flex-row gap-2">
          <Button variant="ghost" size="icon-lg">
            <MicIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={() => {
              api.jarvis["chat-events"].delete();
            }}
          >
            <TrashIcon />
          </Button>
          <Button
            variant="ghost"
            className="ml-auto"
            size="lg"
            onClick={handleSend}
          >
            <SendIcon />
            Send
          </Button>
        </div>
      </div>
      <div className="h-4" />
    </div>
  );
}

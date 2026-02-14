import { useState } from "react";
import { api } from "@/lib/api";
import { Textarea } from "../../ui/textarea";
import InputToolbar from "./toolbar";

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
        <InputToolbar onSend={handleSend} />
      </div>
      <div className="h-4" />
    </div>
  );
}

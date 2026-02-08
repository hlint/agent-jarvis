import type {
  ClientMessage,
  WebSocketMessageForClient,
} from "@repo/shared/defines";
import { useEffect, useRef, useState } from "react";
import { useImmer } from "use-immer";
import { api } from "@/lib/api";
import JarvisMessage from "./message";
import JarvisWelcome from "./welcome";

export default function JarvisMessages() {
  const [wsFlag, setWsFlag] = useState(1);
  const [messages, updateMessages] = useImmer<ClientMessage[]>([]);
  const [thinking, setThinking] = useState("");
  const [streamText, setStreamText] = useState<string | null>(null);
  const listBottomRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    setTimeout(() => {
      if (listBottomRef.current) {
        listBottomRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 500);
  };
  useEffect(() => {
    api.jarvis.messages.get().then((response) => {
      if (response.data) {
        updateMessages(response.data);
      }
    });
  }, [updateMessages]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: wsFlag is used to reconnect the websocket
  useEffect(() => {
    const ws = api.jarvis.ws.subscribe();
    let isConnected = false;
    let timerReconnect: NodeJS.Timeout | null = null;
    const clearTimerReconnect = () => {
      if (timerReconnect) {
        clearTimeout(timerReconnect);
        timerReconnect = null;
      }
    };
    const resetTimerReconnect = () => {
      timerReconnect = setTimeout(() => {
        setWsFlag((prev) => prev + 1);
      }, 2000);
    };
    resetTimerReconnect();
    ws.on("open", () => {
      isConnected = true;
      clearTimerReconnect();
    });
    ws.on("message", ({ data }) => {
      const message = data as WebSocketMessageForClient;
      switch (message.type) {
        case "message":
          updateMessages((draft) => {
            draft.push(message.payload);
          });
          if (message.payload.role === "assistant") {
            setStreamText(null);
          }
          scrollToBottom();
          break;
        case "thinking":
          setThinking(message.payload);
          scrollToBottom();
          break;
        case "reply-stream-start":
          setStreamText("");
          scrollToBottom();
          break;
        case "reply-stream-delta":
          setStreamText((prev) => prev + message.payload);
          scrollToBottom();
          break;
        case "clear-messages":
          updateMessages([]);
          setThinking("");
          setStreamText(null);
          break;
      }
    });
    ws.on("close", () => {
      if (isConnected) {
        isConnected = false;
        resetTimerReconnect();
      }
    });
    return () => {
      clearTimerReconnect();
      ws.close();
    };
  }, [updateMessages, wsFlag]);

  if (messages.length === 0) {
    return <JarvisWelcome />;
  }
  return (
    <div className="flex flex-col gap-4 flex-1 px-2">
      {messages.map((message, index) => (
        <JarvisMessage key={index} text={message.content} type={message.role} />
      ))}
      {thinking && (
        <JarvisMessage text={thinking} type="assistant" isAnimating />
      )}
      {streamText !== null && (
        <JarvisMessage text={streamText} type="assistant" isAnimating />
      )}
      <div className="h-0.5" ref={listBottomRef} />
    </div>
  );
}

import { useEffect, useRef } from "react";
import JarvisMessage from "./message";
import useJarvisStore from "./use-jarvis-store";
import JarvisWelcome from "./welcome";

export default function JarvisMessages() {
  const chatEvents = useJarvisStore((state) => state.chatEvents);
  const setHandleScrollToBottom = useJarvisStore(
    (state) => state.setHandleScrollToBottom,
  );
  const listBottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scrollToBottom = () => {
      setTimeout(() => {
        if (listBottomRef.current) {
          listBottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 500);
    };
    setHandleScrollToBottom(scrollToBottom);
    return () => {
      setHandleScrollToBottom(() => {});
    };
  }, [setHandleScrollToBottom]);

  if (chatEvents.length === 0) {
    return <JarvisWelcome />;
  }
  return (
    <div className="flex flex-col gap-4 flex-1 px-2">
      {chatEvents.map((message, index) => {
        if (message.role === "user" || message.role === "assistant") {
          return (
            <JarvisMessage
              key={index}
              text={message.content}
              type={message.role}
              isAnimating={message.role === "assistant" && message.pending}
            />
          );
        }
        return null;
      })}
      <div className="h-0.5" ref={listBottomRef} />
    </div>
  );
}

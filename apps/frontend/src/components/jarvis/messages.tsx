import { useEffect, useRef } from "react";
import JarvisActionRound from "./action-round";
import JarvisCronTrigger from "./cron-trigger";
import JarvisMessage from "./message";
import JarvisToolCall from "./tool-call";
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
    <div className="flex flex-col gap-3 flex-1 px-2">
      {chatEvents.map((message) => {
        if (message.role === "user" || message.role === "assistant") {
          return (
            <JarvisMessage
              key={message.id}
              text={message.content}
              type={message.role}
              isAnimating={message.role === "assistant" && message.pending}
            />
          );
        }
        if (message.role === "tool-call") {
          return <JarvisToolCall key={message.id} {...message} />;
        }
        if (message.role === "cron-task-trigger") {
          return <JarvisCronTrigger key={message.id} name={message.taskName} />;
        }
        if (message.role === "action-round") {
          return <JarvisActionRound key={message.id} {...message} />;
        }
        return null;
      })}
      <div className="h-0.5" ref={listBottomRef} />
    </div>
  );
}

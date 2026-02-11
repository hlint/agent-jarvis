import { useEffect, useRef } from "react";
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
        switch (message.role) {
          case "user":
          case "assistant":
            return (
              <JarvisMessage
                key={message.id}
                text={message.content}
                type={message.role}
                isAnimating={message.role === "assistant" && message.pending}
              />
            );
          case "tool-call":
            return <JarvisToolCall key={message.id} {...message} />;
          case "cron-task-trigger":
            return (
              <JarvisCronTrigger key={message.id} name={message.taskName} />
            );
          default:
            return null;
        }
      })}
      <div className="h-0.5" ref={listBottomRef} />
    </div>
  );
}

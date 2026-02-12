import { useEffect, useRef } from "react";
import JarvisMessage from "./message";
import JarvisSystemEvent from "./system-event";
import JarvisThinking from "./thinking";
import JarvisToolCall from "./tool-call";
import useJarvisStore from "./use-jarvis-store";
import JarvisWelcome from "./welcome";

export default function JarvisMessages() {
  const dialogHistory = useJarvisStore((state) => state.dialogHistory);
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

  if (dialogHistory.length === 0) {
    return <JarvisWelcome />;
  }
  return (
    <div className="flex flex-col gap-3 flex-1 px-2">
      {dialogHistory.map((historyEntry) => {
        switch (historyEntry.role) {
          case "user":
          case "agent-reply":
            return (
              <JarvisMessage
                key={historyEntry.id}
                text={historyEntry.content ?? ""}
                type={historyEntry.role}
                isAnimating={historyEntry.status === "pending"}
              />
            );
          case "agent-tool-call":
            return <JarvisToolCall key={historyEntry.id} {...historyEntry} />;
          case "system-event":
            return (
              <JarvisSystemEvent key={historyEntry.id} {...historyEntry} />
            );
          case "agent-thinking":
            return <JarvisThinking key={historyEntry.id} {...historyEntry} />;
          default:
            return null;
        }
      })}
      <div className="h-0.5" ref={listBottomRef} />
    </div>
  );
}

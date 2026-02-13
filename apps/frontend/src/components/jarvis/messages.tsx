import { useEffect, useRef } from "react";
import JarvisAssistantEntry from "./entry/assistant";
import JarvisSystemEventEntry from "./entry/system-event";
import JarvisThinkingEntry from "./entry/thinking";
import JarvisToolCallEntry from "./entry/tool-call";
import JarvisUserEntry from "./entry/user";
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
            return (
              <JarvisUserEntry
                key={historyEntry.id}
                text={historyEntry.content ?? ""}
              />
            );
          case "agent-reply":
            return (
              <JarvisAssistantEntry
                key={historyEntry.id}
                text={historyEntry.content ?? ""}
                status={historyEntry.status ?? "pending"}
              />
            );
          case "agent-tool-call":
            return (
              <JarvisToolCallEntry key={historyEntry.id} {...historyEntry} />
            );
          case "system-event":
            return (
              <JarvisSystemEventEntry key={historyEntry.id} {...historyEntry} />
            );
          case "agent-thinking":
            return (
              <JarvisThinkingEntry key={historyEntry.id} {...historyEntry} />
            );
          default:
            return null;
        }
      })}
      <div className="h-0.5" ref={listBottomRef} />
    </div>
  );
}

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import JarvisAssistantEntry from "./entry/assistant";
import JarvisSystemEventEntry from "./entry/system-event";
import JarvisThinkingEntry from "./entry/thinking";
import JarvisToolCallEntry from "./entry/tool-call";
import JarvisUserEntry from "./entry/user";
import useJarvisStore from "./use-jarvis-store";
import JarvisWelcome from "./welcome";

const messageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: {
    opacity: 0,
    y: -8,
    transition: { delay: 1, duration: 0.2, ease: "easeOut" as const },
  },
};

export default function JarvisMessages() {
  const dialogHistory = useJarvisStore((state) => state.dialogHistory);
  const debugMode = useJarvisStore((state) => state.debugMode);
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
      <AnimatePresence initial={false}>
        {dialogHistory.map((historyEntry) => {
          if (
            !debugMode &&
            historyEntry.role !== "agent-reply" &&
            historyEntry?.status === "completed"
          ) {
            return null;
          }
          let entry: ReactNode;
          switch (historyEntry.role) {
            case "user":
              entry = <JarvisUserEntry text={historyEntry.content ?? ""} />;
              break;
            case "agent-reply":
              entry = (
                <JarvisAssistantEntry
                  text={historyEntry.content ?? ""}
                  status={historyEntry.status ?? "pending"}
                />
              );
              break;
            case "agent-tool-call":
              entry = <JarvisToolCallEntry {...historyEntry} />;
              break;
            case "system-event":
              entry = <JarvisSystemEventEntry {...historyEntry} />;
              break;
            case "agent-thinking":
              entry = <JarvisThinkingEntry {...historyEntry} />;
              break;
            default:
              return null;
          }
          return (
            <motion.div
              key={historyEntry.id}
              variants={messageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {entry}
            </motion.div>
          );
        })}
      </AnimatePresence>
      <div className="h-0.5" ref={listBottomRef} />
    </div>
  );
}

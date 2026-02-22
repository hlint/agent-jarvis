import type { AttachmentEntry } from "@repo/shared/defines/jarvis";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import JarvisAssistantEntry from "./entry/assistant";
import JarvisAttachmentEntry from "./entry/attachment";
import JarvisSystemEventEntry from "./entry/system-event";
import JarvisThinkingEntry from "./entry/thinking";
import JarvisToolCallEntry from "./entry/tool-call";
import JarvisUserEntry from "./entry/user";
import useJarvisStore from "./use-jarvis-store";

const messageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { delay: 0, duration: 0.25, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { delay: 1, duration: 0.2, ease: "easeOut" as const },
  },
};

export default function JarvisMessages() {
  const dialogHistory = useJarvisStore((state) => state.dialogHistory);
  const entryHiddenMarks = useJarvisStore((state) => state.entryHiddenMarks);
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
  return (
    <div className="flex flex-col gap-4 flex-1 px-3">
      <AnimatePresence initial>
        {dialogHistory.map((historyEntry) => {
          const shouldHide = entryHiddenMarks[historyEntry.id];
          if (!debugMode && shouldHide) {
            return null;
          }
          let entry: ReactNode;
          switch (historyEntry.role) {
            case "user":
              entry = (
                <JarvisUserEntry
                  text={historyEntry.content ?? ""}
                  createdAt={historyEntry.createdAt}
                />
              );
              break;
            case "agent-reply":
              entry = (
                <JarvisAssistantEntry
                  text={historyEntry.content ?? ""}
                  status={historyEntry.status ?? "pending"}
                  createdAt={historyEntry.createdAt}
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
            case "attachment":
              entry = (
                <JarvisAttachmentEntry {...(historyEntry as AttachmentEntry)} />
              );
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
              transition={{ duration: 0.25, ease: "easeOut" }}
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

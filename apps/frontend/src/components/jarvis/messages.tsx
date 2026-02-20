import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import JarvisAssistantEntry from "./entry/assistant";
import JarvisAttachmentEntry from "./entry/attachment";
import JarvisSystemEventEntry from "./entry/system-event";
import JarvisThinkingEntry from "./entry/thinking";
import JarvisToolCallEntry from "./entry/tool-call";
import JarvisUserEntry from "./entry/user";
import useJarvisStore from "./use-jarvis-store";
import type { AttachmentEntry } from "@repo/shared/defines/jarvis";

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
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [shouldHideIds, setShouldHideIds] = useState<string[]>([]);
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
    <div className="flex flex-col gap-3 flex-1 px-3">
      <AnimatePresence initial={false}>
        {dialogHistory.map((historyEntry) => {
          if (
            !debugMode &&
            historyEntry.role !== "agent-reply" &&
            historyEntry.role !== "attachment" &&
            historyEntry?.status === "completed"
          ) {
            const isInCompletedIds = completedIds.includes(historyEntry.id);
            const shouldHide = shouldHideIds.includes(historyEntry.id);
            if (!isInCompletedIds) {
              setCompletedIds((prev) => [...prev, historyEntry.id]);
              setTimeout(() => {
                setShouldHideIds((prev) => [...prev, historyEntry.id]);
              }, 100);
            }
            if (shouldHide) {
              return null;
            }
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

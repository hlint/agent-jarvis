import type {
  AttachmentEntry,
  HtmlViewEntry,
} from "@repo/shared/defines/jarvis";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import JarvisAssistantEntry from "./entry/assistant";
import JarvisAttachmentEntry from "./entry/attachment";
import JarvisHtmlViewEntry from "./entry/html-view";
import JarvisSystemEventEntry from "./entry/system-event";
import JarvisThinkingEntry from "./entry/thinking";
import JarvisToolCallEntry from "./entry/tool-call";
import JarvisUserEntry from "./entry/user";
import useAdjustIframeHeight from "./use-adjust-iframe-height";
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
  const visibleDialogHistory = useJarvisStore(
    (state) => state.visibleDialogHistory,
  );
  useAdjustIframeHeight();
  return (
    <div className="flex min-w-0 flex-col gap-0 flex-1 px-3">
      <AnimatePresence initial>
        {visibleDialogHistory.map((historyEntry) => {
          let entry: ReactNode;
          let compact = false;
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
                  reasoning={historyEntry.reasoning ?? ""}
                  status={historyEntry.status ?? "pending"}
                  createdAt={historyEntry.createdAt}
                />
              );
              break;
            case "agent-tool-call":
              entry = <JarvisToolCallEntry {...historyEntry} />;
              compact = true;
              break;
            case "system-event":
              entry = <JarvisSystemEventEntry {...historyEntry} />;
              compact = true;
              break;
            case "agent-thinking":
              entry = <JarvisThinkingEntry {...historyEntry} />;
              compact = true;
              break;
            case "attachment":
              entry = (
                <JarvisAttachmentEntry {...(historyEntry as AttachmentEntry)} />
              );
              break;
            case "html-view":
              entry = (
                <JarvisHtmlViewEntry {...(historyEntry as HtmlViewEntry)} />
              );
              break;
            default:
              return null;
          }
          return (
            <motion.div
              id={`entry-message-${historyEntry.id}`}
              key={historyEntry.id}
              variants={messageVariants}
              className={cn(!compact && "my-4", "scroll-mt-16")}
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
    </div>
  );
}

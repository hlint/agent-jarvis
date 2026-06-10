import type { SessionRound } from "@repo/shared/defines/session";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import useAdjustIframeHeight from "../../hooks/use-adjust-iframe-height";
import useJarvisStore from "../../hooks/use-jarvis-store";
import JarvisAssistantMessage, { isAssistantMessageVisible } from "./assistant";
import JarvisUserMessage from "./user";

const userMessageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: "easeIn" as const },
  },
};

const assistantMessageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    y: -6,
    height: 0,
    marginTop: 0,
    marginBottom: 0,
    transition: { duration: 0.2, ease: "easeIn" as const },
  },
};

function JarvisRound({
  round,
  debugMode,
  isLastRound,
}: {
  round: SessionRound;
  debugMode: boolean;
  isLastRound: boolean;
}) {
  return (
    <div
      id={`round-${round.id}`}
      className="flex min-w-0 flex-col gap-0 scroll-mt-16 last:min-h-[calc(100vh-10rem)]"
    >
      <AnimatePresence initial={false}>
        {round.messages.map((message) => {
          if (
            message.role === "assistant" &&
            !isAssistantMessageVisible(message, debugMode, isLastRound)
          ) {
            return null;
          }

          let entry: ReactNode;
          let compact = true;
          switch (message.role) {
            case "user":
              compact = false;
              entry = <JarvisUserMessage {...message} />;
              break;
            case "assistant":
              entry = (
                <JarvisAssistantMessage
                  {...message}
                  debugMode={debugMode}
                  isLastRound={isLastRound}
                />
              );
              break;
            default:
              return null;
          }

          return (
            <motion.div
              id={`message-${message.id}`}
              key={message.id}
              variants={
                message.role === "user"
                  ? userMessageVariants
                  : assistantMessageVariants
              }
              initial="initial"
              animate="animate"
              exit="exit"
              className={cn(
                compact ? "my-1" : "my-3",
                "w-full min-w-0 max-w-full scroll-mt-16 overflow-hidden",
              )}
            >
              {entry}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default function JarvisMessages() {
  const currentSession = useJarvisStore((state) => state.currentSession!);
  const debugMode = useJarvisStore((state) => state.debugMode);
  useAdjustIframeHeight();

  const rounds = currentSession.rounds;

  return (
    <div className="flex min-h-full min-w-0 flex-col gap-0">
      {rounds.map((round, index) => (
        <JarvisRound
          key={round.id}
          round={round}
          debugMode={debugMode}
          isLastRound={index === rounds.length - 1}
        />
      ))}
    </div>
  );
}

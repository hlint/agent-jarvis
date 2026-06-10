import type { AssistantMessage } from "@repo/shared/defines/message";
import { CheckIcon, Loader2Icon, PencilIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import InfoCard from "../../components/Info-card";
import JarvisMarkdown from "../../components/markdown";
import StatusIcon from "../../components/status-icon";
import { resolveToolBadge } from "./tool-display/badges";
import ToolCallDisplay from "./tool-display";
import {
  TOOL_BADGE_LABEL_MAX_WIDTH_CLASS,
} from "./tool-display/utils";

type ToolCall = AssistantMessage["toolCalls"][number];

const fadeSlideVariants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.18, ease: "easeIn" as const },
  },
};

const toolBadgeVariants = {
  initial: { opacity: 0, scale: 0.92 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.18, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    transition: { duration: 0.15, ease: "easeIn" as const },
  },
};

function ToolCallBadge({
  toolCall,
  compact = false,
}: {
  toolCall: ToolCall;
  compact?: boolean;
}) {
  const isPending = toolCall.status === "pending";
  const isFailed = toolCall.status === "failed";
  const { icon: ToolIcon, label } = resolveToolBadge(toolCall);

  return (
    <Popover>
      <PopoverTrigger
        nativeButton={false}
        className="cursor-pointer"
        render={
          <Badge
            variant={isFailed ? "destructive" : "outline"}
            className={cn(
              "min-w-0 max-w-full shrink overflow-hidden whitespace-nowrap",
              isPending &&
                "border-primary/45 bg-primary/10 text-primary shadow-[0_0_12px_-2px] shadow-primary/30",
              compact && "max-w-[min(22ch,38vw)]",
            )}
          />
        }
      >
        {isPending ? (
          <Loader2Icon className="size-2.5 shrink-0 animate-spin" aria-hidden />
        ) : (
          <ToolIcon className="size-2.5 shrink-0 opacity-60" aria-hidden />
        )}
        <span
          className={cn(
            "min-w-0 truncate",
            TOOL_BADGE_LABEL_MAX_WIDTH_CLASS,
            isPending && "animate-pulse",
          )}
        >
          {label}
        </span>
        {isPending ? (
          <span className="relative ml-0.5 flex size-1.5 shrink-0" aria-hidden>
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-70" />
            <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="top"
        sideOffset={6}
        className="flex w-96 max-w-[90vw] max-h-[400px] flex-col overflow-hidden p-0"
      >
        <ToolCallDisplay toolCall={toolCall} />
      </PopoverContent>
    </Popover>
  );
}

function getVisibleToolCalls(
  toolCalls: ToolCall[],
  debugMode: boolean,
  isLastRound: boolean,
): ToolCall[] {
  if (debugMode || isLastRound) return toolCalls;
  return toolCalls.filter((toolCall) => toolCall.status === "pending");
}

function ToolCallBadges({
  toolCalls,
  debugMode,
  isLastRound,
  wrap = true,
  compact = false,
}: {
  toolCalls: ToolCall[];
  debugMode: boolean;
  isLastRound: boolean;
  wrap?: boolean;
  compact?: boolean;
}) {
  const visibleTools = getVisibleToolCalls(toolCalls, debugMode, isLastRound);

  return (
    <AnimatePresence initial={false}>
      {visibleTools.length > 0 ? (
        <motion.div
          key="tool-row"
          variants={fadeSlideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={cn(
            "flex min-w-0 flex-row gap-1",
            wrap ? "flex-wrap" : "shrink-0 flex-nowrap",
          )}
        >
          <AnimatePresence initial={false}>
            {visibleTools.map((toolCall) => (
              <motion.div
                key={toolCall.id}
                variants={toolBadgeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                layout
                className={cn(compact ? "min-w-0 shrink" : "shrink-0")}
              >
                <ToolCallBadge toolCall={toolCall} compact={compact} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function AssistantIndicative({
  status,
  reasoning,
  toolCalls,
  debugMode,
  isLastRound,
}: Pick<AssistantMessage, "status" | "reasoning" | "toolCalls"> & {
  debugMode: boolean;
  isLastRound: boolean;
}) {
  const hasTools = toolCalls.length > 0;
  const visibleTools = getVisibleToolCalls(toolCalls, debugMode, isLastRound);

  if (hasTools && (debugMode || isLastRound || visibleTools.length > 0)) {
    const wrapTools = toolCalls.length > 2;

    return (
      <div
        className={cn(
          "flex w-full min-w-0 gap-1 overflow-hidden",
          wrapTools
            ? "flex-wrap items-start"
            : "flex-nowrap items-center",
        )}
      >
        <div
          className={cn(
            "flex min-w-0 items-center gap-1 overflow-hidden",
            wrapTools ? "w-full" : "shrink",
          )}
        >
          <StatusIcon status={status}>{null}</StatusIcon>
          <span className="min-w-0 truncate text-sm text-muted-foreground">
            {reasoning || "Thinking..."}
          </span>
        </div>
        <ToolCallBadges
          toolCalls={toolCalls}
          debugMode={debugMode}
          isLastRound={isLastRound}
          wrap={wrapTools}
          compact={!wrapTools}
        />
      </div>
    );
  }

  if (reasoning) {
    return (
      <InfoCard
        content={reasoning}
        status={status}
        brief="Reasoning"
        icon={<PencilIcon className="size-4" />}
      />
    );
  }

  return (
    <div className="flex flex-row items-center gap-1">
      <StatusIcon status={status}>
        <CheckIcon className="size-4" />
      </StatusIcon>
      <span className="text-sm text-muted-foreground">Thinking...</span>
    </div>
  );
}

function AssistantBody({
  content,
  status,
  toolCalls,
  debugMode,
  isLastRound,
}: Pick<AssistantMessage, "content" | "status" | "toolCalls"> & {
  debugMode: boolean;
  isLastRound: boolean;
}) {
  return (
    <div className="flex w-full min-w-0 max-w-full flex-col items-start gap-2">
      <div className="min-w-0 max-w-full rounded-xl border border-foreground/0 bg-transparent p-0">
        <JarvisMarkdown text={content} isAnimating={status === "pending"} />
      </div>
      <ToolCallBadges
        toolCalls={toolCalls}
        debugMode={debugMode}
        isLastRound={isLastRound}
      />
    </div>
  );
}

export function isAssistantBody(message: AssistantMessage): boolean {
  return message.content.trim().length > 0;
}

/** B = has content; A = no content. */
export function isAssistantIndicative(message: AssistantMessage): boolean {
  return !isAssistantBody(message);
}

export function isAssistantMessageVisible(
  message: AssistantMessage,
  debugMode: boolean,
  isLastRound = false,
): boolean {
  if (debugMode) return true;
  if (isAssistantBody(message)) return true;
  if (message.status === "pending") return true;
  if (isLastRound && isAssistantIndicative(message)) return true;
  return false;
}

export default function JarvisAssistantMessage({
  content,
  status,
  reasoning,
  toolCalls,
  debugMode = false,
  isLastRound = false,
}: AssistantMessage & { debugMode?: boolean; isLastRound?: boolean }) {
  const hasBody = content.trim().length > 0;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {hasBody ? (
        <motion.div
          key="body"
          variants={fadeSlideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full min-w-0"
        >
          <AssistantBody
            content={content}
            status={status}
            toolCalls={toolCalls}
            debugMode={debugMode}
            isLastRound={isLastRound}
          />
        </motion.div>
      ) : (
        <motion.div
          key="indicative"
          variants={fadeSlideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full min-w-0"
        >
          <AssistantIndicative
            status={status}
            reasoning={reasoning}
            toolCalls={toolCalls}
            debugMode={debugMode}
            isLastRound={isLastRound}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import type { HistoryEntry } from "@repo/shared/agent/defines/history";
import { CheckIcon, Loader2Icon, SearchIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import JarvisMarkdown from "./markdown";

export default function JarvisThinking(historyEntry: HistoryEntry) {
  const { status, content } = historyEntry;
  const isPending = status === "pending";
  return (
    <div className={cn("flex flex-col gap-2")}>
      <div className="flex flex-row gap-2 items-center pl-1 text-muted-foreground">
        {isPending ? (
          <Loader2Icon className="size-4 animate-spin shrink-0 " />
        ) : (
          <CheckIcon className="size-4 shrink-0 " />
        )}
        <span className="text-sm">{isPending ? "Planning..." : "Planned"}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          title="View details in console (for debugging)"
          onClick={() => {
            console.log(historyEntry);
          }}
        >
          <SearchIcon />
        </Button>
      </div>
      {content ? <ThinkingCard text={content} isAnimating={isPending} /> : null}
    </div>
  );
}

function ThinkingCard({
  text,
  isAnimating,
}: {
  text: string;
  isAnimating: boolean;
}) {
  const refBottom = useRef<HTMLDivElement>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to scroll to the bottom when the text changes
  useEffect(() => {
    if (refBottom.current) {
      setTimeout(() => {
        refBottom.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [text]);
  return (
    <div className="bg-muted opacity-70 p-4 rounded-lg overflow-auto max-h-40">
      <JarvisMarkdown
        className="overflow-auto space-y-0.5 text-sm"
        text={text}
        isAnimating={isAnimating}
      />
      <div className="h-0.5" ref={refBottom} />
    </div>
  );
}

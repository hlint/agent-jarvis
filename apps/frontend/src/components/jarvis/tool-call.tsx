import type { HistoryEntry } from "@repo/shared/agent/defines/history";
import { Loader2Icon, SearchIcon, WrenchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export default function JarvisToolCall(historyEntry: HistoryEntry) {
  const { status, brief, toolName } = historyEntry;
  return (
    <div
      className={cn(
        "flex flex-row gap-2 items-center pl-1 text-muted-foreground",
        status === "failed" && "text-destructive",
      )}
    >
      {status === "pending" ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : (
        <WrenchIcon className="size-4" />
      )}
      <span className="text-sm">
        {brief} ({toolName})
      </span>
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
  );
}

import type { HistoryEntry } from "@repo/shared/agent/defines/history";
import { AlertCircleIcon, Loader2Icon, SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export default function JarvisSystemEvent(historyEntry: HistoryEntry) {
  const { status, content } = historyEntry;
  return (
    <div>
      <div
        className={cn(
          "flex flex-row gap-2 items-center pl-1 text-muted-foreground",
          status === "failed" && "text-destructive",
        )}
      >
        {status === "pending" ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <AlertCircleIcon className="size-4" />
        )}
        <span className="text-sm">{content}</span>
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
    </div>
  );
}

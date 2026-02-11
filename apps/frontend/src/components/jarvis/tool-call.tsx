import type { ToolCallChatEvent } from "@repo/shared/defines/chat-event";
import { Loader2Icon, SearchIcon, WrenchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export default function JarvisToolCall(toolCallChatEvent: ToolCallChatEvent) {
  const { pending, brief, toolName } = toolCallChatEvent;
  return (
    <div>
      <div
        className={cn(
          "flex flex-row gap-2 items-center pl-1 text-muted-foreground",
        )}
      >
        {pending ? (
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
            console.log(toolCallChatEvent);
          }}
        >
          <SearchIcon />
        </Button>
      </div>
      {/* <div className="text-sm ml-7">
        {JSON.stringify({
          input: toolCallChatEvent.toolInput,
          output: toolCallChatEvent.toolOutput,
        })}
      </div> */}
    </div>
  );
}

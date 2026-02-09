import type { ToolCallChatEvent } from "@repo/shared/defines/chat-event";
import { CheckCircleIcon, Loader2Icon } from "lucide-react";

export default function JarvisToolCall({
  pending,
  brief,
}: Pick<ToolCallChatEvent, "toolName" | "pending" | "brief">) {
  return (
    <div className="flex flex-row gap-2 items-center pl-1">
      {pending ? (
        <Loader2Icon className="size-4 text-muted-foreground animate-spin" />
      ) : (
        <CheckCircleIcon className="size-4 text-primary" />
      )}
      <span className="text-sm text-muted-foreground">{brief}</span>
    </div>
  );
}

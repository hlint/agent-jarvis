import type { ActionRoundChatEvent } from "@repo/shared/defines/chat-event";
import { CircleDotIcon, Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function JarvisActionRound({
  pending,
  round,
}: Pick<ActionRoundChatEvent, "pending" | "round">) {
  return (
    <div
      className={cn(
        "flex flex-row gap-2 items-center pl-1 text-muted-foreground",
      )}
    >
      {pending ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : (
        <CircleDotIcon className="size-4" />
      )}
      <span className="text-sm">Action Round: {round}</span>
    </div>
  );
}

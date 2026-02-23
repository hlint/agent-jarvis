import { smartTimeFormat } from "@repo/shared/lib/time";
import JarvisMarkdown from "../components/markdown";
import StatusIcon from "../components/StatusIcon";

export default function JarvisAssistantEntry({
  text,
  status,
  createdAt,
}: {
  text: string;
  status: "pending" | "completed" | "failed";
  createdAt: number;
}) {
  if (!text && status === "pending") {
    return (
      <div className="flex">
        <StatusIcon status="pending" />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3 max-w-[90%]">
      <div className="rounded-xl bg-neutral-900 border border-foreground/10 p-3">
        <JarvisMarkdown
          className="overflow-auto mr-2"
          text={text}
          isAnimating={status === "pending"}
        />
      </div>
      <span className="text-xs text-muted-foreground">
        {smartTimeFormat(createdAt)}
      </span>
    </div>
  );
}

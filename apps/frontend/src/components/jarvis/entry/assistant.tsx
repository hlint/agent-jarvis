import { smartTimeFormat } from "@repo/shared/lib/time";
import { PencilIcon } from "lucide-react";
import InfoCard from "../components/InfoCard";
import JarvisMarkdown from "../components/markdown";

export default function JarvisAssistantEntry({
  text,
  status,
  createdAt,
  reasoning,
}: {
  text: string;
  reasoning: string;
  status: "pending" | "completed" | "failed";
  createdAt: number;
}) {
  if (!text && status === "pending") {
    return (
      <InfoCard
        content={reasoning}
        status={status}
        brief="Answering"
        icon={<PencilIcon className="size-4" />}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3 max-w-[90%]">
      <div className="rounded-xl bg-neutral-900 border border-foreground/10 p-3">
        <JarvisMarkdown text={text} isAnimating={status === "pending"} />
      </div>
      <span className="text-xs text-muted-foreground">
        {smartTimeFormat(createdAt)}
      </span>
    </div>
  );
}

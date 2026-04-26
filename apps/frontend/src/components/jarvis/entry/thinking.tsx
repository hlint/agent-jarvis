import type { HistoryEntry } from "@repo/shared/agent/defines/history";
import { LightbulbIcon } from "lucide-react";
import InfoCard from "../components/InfoCard";

export default function JarvisThinkingEntry(historyEntry: HistoryEntry) {
  const { status, action } = historyEntry;
  const actionType = action?.type;
  return (
    <InfoCard
      icon={<LightbulbIcon className="size-4" />}
      brief={"Reasoning"}
      tag={actionType}
      status={status}
      content={[
        historyEntry.reasoning ?? "",
        historyEntry.content ?? "",
        historyEntry.error ?? "",
      ].join("\n")}
      data={historyEntry.action || {}}
    />
  );
}

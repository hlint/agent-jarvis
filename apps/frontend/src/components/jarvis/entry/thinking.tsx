import type { HistoryEntry } from "@repo/shared/agent/defines/history";
import { pick } from "es-toolkit";
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
      content={
        historyEntry.error ||
        historyEntry.content ||
        historyEntry.action?.reasoning
      }
      data={
        historyEntry.action
          ? pick(historyEntry.action, ["toolCalls", "outputNext", "done"])
          : {}
      }
    />
  );
}

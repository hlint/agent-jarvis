import type { HistoryEntry } from "@repo/shared/agent/defines/history";
import { pick } from "es-toolkit";
import InfoCard from "../components/InfoCard";

export default function JarvisThinkingEntry(historyEntry: HistoryEntry) {
  const { status, content, action } = historyEntry;
  const actionType = action?.type;
  return (
    <InfoCard
      brief={"Reasoning"}
      tag={actionType}
      status={status}
      content={content}
      data={pick(historyEntry, ["action", "error"])}
    />
  );
}

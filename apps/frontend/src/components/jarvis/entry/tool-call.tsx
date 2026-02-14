import type { HistoryEntry } from "@repo/shared/agent/defines/history";
import { pick } from "es-toolkit";
import { WrenchIcon } from "lucide-react";
import InfoCard from "../components/InfoCard";

export default function JarvisToolCallEntry(historyEntry: HistoryEntry) {
  const { status, brief, toolName } = historyEntry;
  return (
    <InfoCard
      icon={<WrenchIcon className="size-4" />}
      brief={brief}
      status={status}
      tag={toolName}
      data={pick(historyEntry, ["toolInput", "toolOutput", "data", "error"])}
    />
  );
}

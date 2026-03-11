import type { HistoryEntry } from "@repo/shared/agent/defines/history";
import { pick } from "es-toolkit";
import { InfoIcon } from "lucide-react";
import InfoCard from "../components/InfoCard";

export default function JarvisSystemEventEntry(historyEntry: HistoryEntry) {
  const { status, brief, content } = historyEntry;
  return (
    <InfoCard
      icon={<InfoIcon className="size-4" />}
      brief={`${brief} `}
      status={status}
      content={content}
      tag={historyEntry.error ? "error" : "system-event"}
      data={pick(historyEntry, ["data", "error"])}
    />
  );
}

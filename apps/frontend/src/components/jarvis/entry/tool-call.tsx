import type { HistoryEntry } from "@repo/shared/agent/defines/history";
import { pick } from "es-toolkit";
import {
  FilePenIcon,
  FilePenLineIcon,
  FileTextIcon,
  WrenchIcon,
} from "lucide-react";
import InfoCard from "../components/InfoCard";

export default function JarvisToolCallEntry(historyEntry: HistoryEntry) {
  const { status, brief, toolName } = historyEntry;
  if (!historyEntry.error) {
    if (toolName === "read-file") {
      return (
        <InfoCard
          icon={<FileTextIcon className="size-4" />}
          brief={brief}
          status={status}
          tag={historyEntry.toolInput.path}
          content={historyEntry.toolOutput}
          disableMarkdown
        />
      );
    }
    if (toolName === "edit-file") {
      return (
        <InfoCard
          icon={<FilePenLineIcon className="size-4" />}
          brief={brief}
          status={status}
          tag={historyEntry.toolInput.path}
          content={`OLD TEXT >>>\n${historyEntry.toolInput.oldText}\n========================\nNEW TEXT >>>\n\n${historyEntry.toolInput.newText}`}
          disableMarkdown
        />
      );
    }
    if (toolName === "write-file" || toolName === "append-to-file") {
      return (
        <InfoCard
          icon={<FilePenIcon className="size-4" />}
          brief={brief}
          status={status}
          tag={historyEntry.toolInput.path}
          content={historyEntry.toolInput.content}
          disableMarkdown
        />
      );
    }
  }
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

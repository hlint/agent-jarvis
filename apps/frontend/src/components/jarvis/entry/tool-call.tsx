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
  const { status, brief, toolName, toolInput } = historyEntry;
  const hasToolInput = toolInput != null;
  if (!historyEntry.error && hasToolInput) {
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
          content={`OLD TEXT >>>\n${historyEntry.toolInput.oldText}\n========================\nNEW TEXT >>>\n\n${historyEntry.toolInput.content ?? ""}`}
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
      content={hasToolInput ? undefined : historyEntry.content}
      data={
        hasToolInput
          ? pick(historyEntry, ["toolInput", "toolOutput", "data", "error"])
          : historyEntry.error
            ? { error: historyEntry.error }
            : undefined
      }
    />
  );
}

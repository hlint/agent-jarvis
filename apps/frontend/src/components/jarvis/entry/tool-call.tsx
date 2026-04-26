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
  const {
    status,
    brief,
    toolName,
    toolInput,
    reasoning,
    content,
    error,
    toolOutput,
  } = historyEntry;
  if (!error) {
    if (toolName === "read-file") {
      return (
        <InfoCard
          icon={<FileTextIcon className="size-4" />}
          brief={brief}
          status={status}
          tag={toolInput?.path}
          content={toolOutput || reasoning}
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
          tag={toolInput?.path}
          content={
            toolInput
              ? `OLD TEXT >>>\n${toolInput?.oldText ?? ""}\n========================\nNEW TEXT >>>\n\n${toolInput?.content ?? ""}`
              : reasoning
          }
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
          tag={toolInput?.path}
          content={toolInput?.content || reasoning}
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
      content={content || reasoning}
      data={pick(historyEntry, ["toolInput", "toolOutput", "data", "error"])}
    />
  );
}

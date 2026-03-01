import { timeFormat } from "../../lib/time";
import { shortId } from "../../lib/utils";
import type { AgentContext } from "../defines/context";
import type { HistoryEntry } from "../defines/history";

export default async function processOutputDirectly({
  dialogHistory,
  lastThinkAction,
  onDialogHistoryChange,
}: AgentContext) {
  /** Output content directly */
  const outputContent = lastThinkAction?.outputDirectly;
  if (!outputContent) return;
  const entry: HistoryEntry = {
    id: shortId(),
    role: "agent-reply",
    status: "completed",
    createdTime: timeFormat(),
    createdAt: Date.now(),
    content: outputContent,
  };
  dialogHistory.push(entry);
  onDialogHistoryChange();
}

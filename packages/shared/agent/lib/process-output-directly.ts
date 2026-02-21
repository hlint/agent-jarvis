import { timeFormat } from "../../lib/time";
import { shortId } from "../../lib/utils";
import type { AgentContext } from "../defines/context";
import type { HistoryEntry } from "../defines/history";

export default async function processOutputDirectly({
  dialogHistory,
  lastThinkAction,
  onDialogHistoryChange,
}: AgentContext) {
  /** 直接输出内容 */
  const outputContent = lastThinkAction?.outputDirectly;
  if (!outputContent) return;
  const entry: HistoryEntry = {
    id: shortId(),
    role: "agent-reply",
    status: "completed",
    createdTime: timeFormat(),
    updatedTime: timeFormat(),
    content: outputContent,
  };
  dialogHistory.push(entry);
  onDialogHistoryChange();
}

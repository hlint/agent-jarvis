import { timeFormat } from "../../lib/time";
import { shortId } from "../../lib/utils";
import type { AgentContext } from "../defines/context";

export default async function processAbort({
  dialogHistory,
  onDialogHistoryChange,
}: AgentContext) {
  dialogHistory.push({
    id: shortId(),
    role: "system-event",
    createdTime: timeFormat(),
    content: `The agent's execution has been aborted by user.`,
  });
  onDialogHistoryChange();
}

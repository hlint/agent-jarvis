import { timeFormat } from "../../lib/time";
import { shortId } from "../../lib/utils";
import type { AgentContext } from "../defines/context";

export default async function processOverSteps({
  dialogHistory,
  onDialogHistoryChange,
}: AgentContext) {
  dialogHistory.push({
    id: shortId(),
    role: "system-event",
    createdTime: timeFormat(),
    content:
      "The agent has reached the maximum number of steps and stopped by system. Please ask the user to continue the conversation. (e.g. 'Sorry, I have reached the maximum number of steps. Should I continue?')",
  });
  onDialogHistoryChange();
}

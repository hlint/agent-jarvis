import { timeFormat } from "../../lib/time";
import { shortId } from "../../lib/utils";
import type { AgentContext } from "../defines/context";
import type { HistoryEntry } from "../defines/history";

export default async function processUserBriefing({
  dialogHistory,
  onDialogHistoryChange,
  lastThinkAction,
}: AgentContext) {
  const userBriefing = lastThinkAction?.userBriefing;
	if (!userBriefing) return;
	const entry: HistoryEntry = {
		id: shortId(),
		role: "agent-reply",
		status: "completed",
		createdTime: timeFormat(),
		updatedTime: timeFormat(),
		content: userBriefing,
	};
	dialogHistory.push(entry);
	onDialogHistoryChange();
}

import { timeFormat } from "../../lib/time";
import { shortId } from "../../lib/utils";
import type { AgentContext } from "../defines/context";
import type { CallToolsAction } from "../defines/think-action";

export default async function processToolCalling({
  dialogHistory,
  tools,
  onDialogHistoryChange,
  lastThinkAction,
}: AgentContext) {
  const callToolsAction = lastThinkAction! as CallToolsAction;

  if (callToolsAction.userBriefing?.trim()) {
    dialogHistory.push({
      id: shortId(),
      role: "agent-reply",
      status: "completed",
      createdTime: timeFormat(),
      updatedTime: timeFormat(),
      content: callToolsAction.userBriefing.trim(),
    });
    onDialogHistoryChange();
  }

  const tasks: Promise<void>[] = [];
  for (const toolCall of callToolsAction.toolCalls) {
    const id = shortId();
    dialogHistory.push({
      id,
      role: "agent-tool-call",
      status: "pending",
      createdTime: timeFormat(),
      updatedTime: timeFormat(),
      brief: toolCall.brief,
      toolName: toolCall.toolName,
      toolInput: toolCall.input,
      toolOutput: null,
    });
    onDialogHistoryChange();

    tasks.push(
      (async () => {
        const entry = dialogHistory.find((item) => item.id === id);
        if (entry) {
          try {
            const tool = tools.find((tool) => tool.name === toolCall.toolName);
            if (!tool) {
              throw new Error(`Tool not found: ${toolCall.toolName}`);
            }
            const toolCallOuput = (await tool.execute(toolCall.input)) ?? null;
            entry.toolOutput = toolCallOuput;
            entry.status = "completed";
          } catch (error) {
            entry.status = "failed";
            entry.error =
              error instanceof Error ? error.message : String(error);
            entry.toolOutput = `Something went wrong when this tool was called. `;
          }
          entry.updatedTime = timeFormat();
          onDialogHistoryChange();
        }
      })(),
    );
  }
  await Promise.all(tasks);
}

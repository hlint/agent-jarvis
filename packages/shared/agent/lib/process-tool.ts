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
  const tasks: Promise<void>[] = [];
  for (const toolCall of callToolsAction.toolCalls) {
    const id = shortId();
    dialogHistory.push({
      id,
      role: "agent-tool-call",
      status: "pending",
      createdTime: timeFormat(),
      updatedTime: timeFormat(),
      content: toolCall.brief,
      input: toolCall.input,
      output: null,
    });

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
            entry.output = toolCallOuput;
            entry.status = "completed";
          } catch (error) {
            entry.status = "failed";
            entry.output = `Something went wrong: ${error}`;
          }
          entry.updatedTime = timeFormat();
          onDialogHistoryChange();
        }
      })(),
    );
  }
  await Promise.all(tasks);
}

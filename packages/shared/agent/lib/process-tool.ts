import { delay } from "es-toolkit";
import { timeFormat } from "../../lib/time";
import { shortId } from "../../lib/utils";
import type { AgentContext } from "../defines/context";
import type { HistoryEntry } from "../defines/history";

export default async function processToolCalling({
  dialogHistory,
  tools,
  onDialogHistoryChange,
  lastThinkAction,
}: AgentContext) {
  const toolCalls = lastThinkAction?.toolCalls;
  if (!toolCalls) return;
  const tasks: Promise<void>[] = [];
  for (const [index, toolCall] of toolCalls.entries()) {
    tasks.push(
      (async () => {
        // 避免一些时序问题
        await delay(index * 500);
        const entry: HistoryEntry = {
          id: shortId(),
          role: "agent-tool-call",
          status: "pending",
          createdTime: timeFormat(),
          createdAt: Date.now(),
          brief: toolCall.brief,
          toolName: toolCall.toolName,
          toolInput: toolCall.input,
          toolOutput: null,
        };
        dialogHistory.push(entry);
        onDialogHistoryChange();
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
          onDialogHistoryChange();
        }
      })(),
    );
  }
  await Promise.all(tasks);
}

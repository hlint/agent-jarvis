import { cloneDeep } from "es-toolkit";
import { timeFormat } from "../../lib/time";
import { shortId } from "../../lib/utils";
import callLlm from "../../llm/call-llm";
import type { AgentContext } from "../defines/context";
import type { HistoryEntry } from "../defines/history";
import { outputContentPrompt } from "../prompt/output";
import { getToolsInfo, parsePrompt } from "./llm-parse";

export default async function processOutput({
  llmModel,
  llmApiKey,
  llmBaseUrl,
  tools,
  dialogHistory,
  additionalAgentInformation,
  lastThinkAction,
  onDialogHistoryChange,
}: AgentContext) {
  const outputNext = lastThinkAction?.outputNext;
  if (!outputNext) return;
  // 调用输出节点
  const clonedDialogHistory = cloneDeep(dialogHistory);
  const entry: HistoryEntry = {
    id: shortId(),
    role: "agent-reply",
    status: "pending",
    createdTime: timeFormat(),
    updatedTime: timeFormat(),
  };
  dialogHistory.push(entry);
  onDialogHistoryChange();
  try {
    await callLlm({
      model: llmModel,
      apiKey: llmApiKey,
      baseURL: llmBaseUrl,
      dialog: [
        {
          role: "system",
          content: parsePrompt(outputContentPrompt, {
            "tool-descriptions": getToolsInfo(tools),
          }),
        },
        {
          role: "user",
          content: `Here are some information about the agent and this full dialog history:
	
	Current Time: ${timeFormat()}
	${additionalAgentInformation}
	
	Dialog History:
	${JSON.stringify(clonedDialogHistory)}
	`,
        },
      ],
      onStream: (content) => {
        entry.content = content;
        entry.updatedTime = timeFormat();
        onDialogHistoryChange();
      },
    });
  } catch (error) {
    entry.status = "failed";
    entry.content = `Something went wrong when outputting content.`;
    entry.error = error instanceof Error ? error.message : String(error);
    entry.updatedTime = timeFormat();
    onDialogHistoryChange();
    throw error;
  }
  entry.status = "completed";
  entry.updatedTime = timeFormat();
  onDialogHistoryChange();
}

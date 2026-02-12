import { cloneDeep } from "es-toolkit";
import { timeFormat } from "../../lib/time";
import { shortId } from "../../lib/utils";
import callLlm from "../../llm";
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
  onDialogHistoryChange,
}: AgentContext) {
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
}

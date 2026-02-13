import { cloneDeep } from "es-toolkit";
import { timeFormat } from "../../lib/time";
import { shortId } from "../../lib/utils";
import callLlm from "../../llm";
import type { AgentContext } from "../defines/context";
import type { HistoryEntry } from "../defines/history";
import { ThinkActionSchema } from "../defines/think-action";
import { thinkPrompt } from "../prompt/think";
import {
  getToolsInfo,
  parseLlmResultBeforeDivider,
  parseLlmResultWithDivider,
  parsePrompt,
} from "./llm-parse";

export default async function processThinking({
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
    role: "agent-thinking",
    status: "pending",
    createdTime: timeFormat(),
    updatedTime: timeFormat(),
  };
  dialogHistory.push(entry);
  onDialogHistoryChange();
  try {
    const response = await callLlm({
      model: llmModel,
      apiKey: llmApiKey,
      baseURL: llmBaseUrl,
      dialog: [
        {
          role: "system",
          content: parsePrompt(thinkPrompt, {
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
        entry.content = parseLlmResultBeforeDivider(content);
        entry.updatedTime = timeFormat();
        onDialogHistoryChange();
      },
    });
    const [reasoning, thinkAction] = parseLlmResultWithDivider(
      response.text,
      ThinkActionSchema,
    );
    entry.status = "completed";
    entry.content = reasoning;
    entry.action = thinkAction;
    entry.updatedTime = timeFormat();
    onDialogHistoryChange();
    return thinkAction;
  } catch (error) {
    entry.status = "failed";
    entry.content = `Something went wrong: ${error}`;
		entry.error = error instanceof Error ? error.message : String(error);
    entry.updatedTime = timeFormat();
    onDialogHistoryChange();
    throw error;
  }
}

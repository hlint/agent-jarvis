import { streamText } from "ai";
import { cloneDeep } from "es-toolkit";
import { timeFormat } from "../../lib/time";
import { shortId } from "../../lib/utils";
import { getLanguageModel } from "../../llm/get-model";
import type { AgentContext } from "../defines/context";
import type { HistoryEntry } from "../defines/history";
import { ThinkActionSchema } from "../defines/think-action";
import { defeaultThinkingRequirements, thinkPrompt } from "../prompt/think";
import {
  getToolsInfo,
  parseLlmResultBeforeDivider,
  parseLlmResultWithDivider,
  parsePrompt,
} from "./llm-parse";

export default async function processThinking({
  thinkProvider,
  tools,
  dialogHistory,
  additionalAgentInformation,
  thinkingRequirements,
  onDialogHistoryChange,
}: AgentContext) {
  const clonedDialogHistory = cloneDeep(dialogHistory);
  const entry: HistoryEntry = {
    id: shortId(),
    role: "agent-thinking",
    status: "pending",
    createdTime: timeFormat(),
    createdAt: Date.now(),
  };
  dialogHistory.push(entry);
  onDialogHistoryChange();
  try {
    const { fullStream, usage } = streamText({
      model: getLanguageModel(thinkProvider),
      providerOptions: thinkProvider.providerOptions,
      messages: [
        {
          role: "system",
          content: parsePrompt(thinkPrompt, {
            "tool-descriptions": getToolsInfo(tools),
            "tool-names": JSON.stringify(tools.map((tool) => tool.name)),
            "thinking-requirements":
              thinkingRequirements || defeaultThinkingRequirements,
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
    });
    let content = "";
    for await (const chunk of fullStream) {
      if (chunk.type === "text-delta") {
        content += chunk.text;
        entry.content = parseLlmResultBeforeDivider(content);
        onDialogHistoryChange();
      }
    }
    const [reasoning, thinkAction] = parseLlmResultWithDivider(
      content,
      ThinkActionSchema,
    );
    entry.status = "completed";
    entry.content = reasoning;
    entry.action = thinkAction;
    entry.inputTokens = (await usage).inputTokens;
    onDialogHistoryChange();
    return thinkAction;
  } catch (error) {
    entry.status = "failed";
    entry.content = `Something went wrong during reasoning.`;
    entry.error = error instanceof Error ? error.message : String(error);
    onDialogHistoryChange();
    throw error;
  }
}

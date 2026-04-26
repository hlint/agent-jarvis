import { streamText } from "ai";
import { cloneDeep } from "es-toolkit";
import { timeFormat } from "../../lib/time";
import { shortId } from "../../lib/utils";
import { getLanguageModel } from "../../llm/get-model";
import { streamTextOptions } from "../defines/constant";
import type { AgentContext } from "../defines/context";
import type { HistoryEntry } from "../defines/history";
import { ThinkActionSchema } from "../defines/think-action";
import {
  defaultThinkingExample,
  defaultThinkingRequirements,
  thinkPrompt,
} from "../prompt/think";
import {
  extractStreamingThinkMarkdown,
  getToolsInfo,
  parsePrompt,
  parseThinkMarkdownAndAction,
} from "./llm-parse";

export default async function processThinking({
  thinkProvider,
  tools,
  dialogHistory,
  additionalAgentInformation,
  thinkingRequirements,
  onDialogHistoryChange,
  thinkingExample,
}: AgentContext) {
  const clonedDialogHistory = cloneDeep(dialogHistory);
  const entry: HistoryEntry = {
    id: shortId(),
    role: "agent-thinking",
    status: "pending",
    content: "",
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
              thinkingRequirements || defaultThinkingRequirements,
            "thinking-example": thinkingExample || defaultThinkingExample,
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
      ...streamTextOptions,
    });
    let content = "";
    let reasoningRaw = "";
    for await (const chunk of fullStream) {
      if (chunk.type === "reasoning-delta") {
        reasoningRaw += chunk.text;
        entry.reasoning = reasoningRaw;
        onDialogHistoryChange();
      }
      // Reasoning models may put the full markdown+JSON in the reasoning stream and leave the main text stream empty, so we must accumulate both to parse the action reliably.
      if (chunk.type === "text-delta") {
        content += chunk.text;
        entry.content = extractStreamingThinkMarkdown(content);
        onDialogHistoryChange();
      }
    }
    const [reasoning, thinkAction] = parseThinkMarkdownAndAction(
      content || reasoningRaw,
      ThinkActionSchema,
    );
    const normalizedReasoning =
      reasoning.trim().length > 0
        ? reasoning
        : "*(No thinking text; model returned JSON-only action.)*";
    entry.status = "completed";
    entry.content = normalizedReasoning;
    entry.action = thinkAction;
    entry.inputTokens = (await usage).inputTokens;
    onDialogHistoryChange();
    return thinkAction;
  } catch (error) {
    entry.status = "failed";
    entry.content += `\n\nSomething went wrong during reasoning.`;
    entry.error = error instanceof Error ? error.message : String(error);
    onDialogHistoryChange();
    throw error;
  }
}

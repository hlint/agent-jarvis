import { streamText } from "ai";
import { cloneDeep } from "es-toolkit";
import { timeFormat } from "../../lib/time";
import { shortId } from "../../lib/utils";
import { getLanguageModel } from "../../llm/get-model";
import { streamTextOptions } from "../defines/constant";
import type { AgentContext } from "../defines/context";
import type { HistoryEntry } from "../defines/history";
import { outputContentPrompt } from "../prompt/output";
import { getToolsInfo, parsePrompt } from "./llm-parse";

export async function processOutputInstruction(
  {
    thinkProvider,
    outputProvider,
    tools,
    dialogHistory,
    additionalAgentInformation,
    onDialogHistoryChange,
  }: AgentContext,
  outputInstruction: string,
) {
  const clonedDialogHistory = cloneDeep(dialogHistory);
  const entry: HistoryEntry = {
    id: shortId(),
    role: "agent-reply",
    status: "pending",
    createdTime: timeFormat(),
    createdAt: Date.now(),
  };
  dialogHistory.push(entry);
  onDialogHistoryChange();
  try {
    const provider = outputProvider ?? thinkProvider;
    const { fullStream } = streamText({
      model: getLanguageModel(provider),
      providerOptions: provider.providerOptions,
      ...streamTextOptions,
      messages: [
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

	Output Instruction: ${outputInstruction}
	`,
        },
      ],
    });
    let content = "";
    let reasoning = "";
    for await (const chunk of fullStream) {
      if (chunk.type === "reasoning-delta") {
        reasoning += chunk.text;
        entry.reasoning = reasoning;
        onDialogHistoryChange();
      }
      if (chunk.type === "text-delta") {
        content += chunk.text;
        entry.content = content;
        onDialogHistoryChange();
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    entry.status = "failed";
    entry.content = `Something went wrong when outputting content: ${errorMessage}`;
    entry.error = errorMessage;
    onDialogHistoryChange();
    throw error;
  }
  entry.status = "completed";
  onDialogHistoryChange();
}

export default async function processOutput({
  thinkProvider,
  outputProvider,
  tools,
  dialogHistory,
  additionalAgentInformation,
  lastThinkAction,
  onDialogHistoryChange,
}: AgentContext) {
  if (!lastThinkAction || lastThinkAction.actionType !== "output") {
    throw new Error("processOutput called without an output thinkAction");
  }
  return await processOutputInstruction(
    {
      thinkProvider,
      outputProvider,
      tools,
      dialogHistory,
      additionalAgentInformation,
      onDialogHistoryChange,
    } as AgentContext,
    lastThinkAction.outputInstruction,
  );
}

import { streamText } from "ai";
import { cloneDeep } from "es-toolkit";
import { timeFormat } from "../../lib/time";
import { shortId } from "../../lib/utils";
import { getLanguageModel } from "../../llm/get-model";
import { streamTextOptions } from "../defines/constant";
import type { AgentContext } from "../defines/context";
import type { HistoryEntry } from "../defines/history";
import type { ToolCallItem } from "../defines/think-action";
import { getToolParamsPrompt } from "../prompt/tool-params";
import { betterJsonParse, parseCompositeToolParamsOutput } from "./llm-parse";

export default async function processToolCalling({
  dialogHistory,
  tools,
  thinkProvider,
  additionalAgentInformation,
  onDialogHistoryChange,
  lastThinkAction,
}: AgentContext) {
  const toolCalls = lastThinkAction?.toolCalls;
  if (!toolCalls) return;
  const handleToolCall = async (toolCall: ToolCallItem) => {
    const clonedHistory = cloneDeep(dialogHistory);
    const entry: HistoryEntry = {
      id: shortId(),
      role: "agent-tool-call",
      status: "pending",
      createdTime: timeFormat(),
      createdAt: Date.now(),
      brief: toolCall.brief,
      toolName: toolCall.toolName,
      toolInput: undefined,
      toolOutput: null,
    };
    dialogHistory.push(entry);
    onDialogHistoryChange();

    const tool = tools.find((t) => t.name === toolCall.toolName);
    if (!tool) {
      entry.status = "failed";
      entry.error = `Tool not found: ${toolCall.toolName}`;
      entry.toolOutput = "Something went wrong when this tool was called.";
      onDialogHistoryChange();
      return;
    }

    try {
      const inputSchemaJson = JSON.stringify(
        tool.inputSchema.toJSONSchema(),
        null,
        2,
      );
      const { fullStream } = streamText({
        model: getLanguageModel(thinkProvider),
        providerOptions: thinkProvider.providerOptions,
        ...streamTextOptions,
        messages: [
          {
            role: "system",
            content: getToolParamsPrompt({
              description: tool.description,
              inputSchemaJson,
              inputContentDescription: tool.inputContentDescription,
            }),
          },
          {
            role: "user",
            content: `Current Time: ${timeFormat()}
${additionalAgentInformation}

Dialog History:
${JSON.stringify(clonedHistory)}

---
Tool to call: ${toolCall.toolName}
Brief (intended purpose): ${toolCall.brief}

Generate the Input Parameters as JSON and Input Content(if needed).`,
          },
        ],
      });

      let content = "";
      for await (const chunk of fullStream) {
        if (chunk.type === "text-delta") {
          content += chunk.text;
          entry.content = content;
          onDialogHistoryChange();
        }
      }

      const useCompositeInput =
        tool.inputContentDescription != null &&
        tool.inputContentDescription.trim() !== "";

      const toolInput = useCompositeInput
        ? parseCompositeToolParamsOutput(content, tool.inputSchema)
        : (tool.inputSchema.parse(betterJsonParse(content)) as {
            content?: string;
          });
      entry.content = undefined;
      entry.toolInput = toolInput;
      onDialogHistoryChange();

      const toolCallOutput = (await tool.execute(toolInput)) ?? null;
      entry.toolOutput = toolCallOutput;
      entry.status = "completed";
    } catch (error) {
      entry.status = "failed";
      entry.content = undefined;
      entry.error = error instanceof Error ? error.message : String(error);
      entry.toolOutput = "Something went wrong when this tool was called.";
    }
    onDialogHistoryChange();
  };
  const maxOrder = Math.max(...toolCalls.map((t) => t.order));
  for (let i = 1; i <= maxOrder; i++) {
    const toolCallsWithOrder = toolCalls.filter((t) => t.order === i);
    const tasks = toolCallsWithOrder.map((t) => handleToolCall(t));
    await Promise.all(tasks);
  }
}

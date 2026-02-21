import { z } from "zod";

export const ToolCallItemSchema = z.object({
  toolName: z.string().describe("Name of the tool"),
  brief: z
    .string()
    .describe(
      "A short one-sentence summary of the tool invocation action. Do not include specific parameters here; parameters should be provided in the input field. Provide the summary in the user's language.",
    ),
  input: z
    .any()
    .optional()
    .describe("Input(parameters) for the tool, following the tool's schema"),
});

export const ThinkActionSchema = z.object({
  userBriefing: z
    .string()
    .optional()
    .describe(
      "Optional. Immediate output before tools. Text shown to user right away. Use for short status e.g. 'Searching, please wait'.",
    ),
  toolCalls: z
    .array(ToolCallItemSchema)
    .optional()
    .describe("Optional. Tool call tasks to execute in parallel."),
  outputNext: z
    .string()
    .optional()
    .describe(
      "Optional. Instructions for how the output node should present the content. Only provide guidance and requirements, not the complete output content.",
    ),
  outputDirectly: z
    .string()
    .optional()
    .describe(
      "Optional. Immediate output after tools. Text shown to user right away. For simple, brief replies only.",
    ),
  done: z
    .boolean()
    .describe(
      "True: after this round's actions (toolCalls/outputNext/outputDirectly/silent) complete, the execution loop ends. False: after tools run, control returns to the think node for another round.",
    ),
});

export type ThinkAction = z.infer<typeof ThinkActionSchema>;
export type ToolCallItem = z.infer<typeof ToolCallItemSchema>;

export function isNothingToDo(thinkAction: ThinkAction) {
  return (
    thinkAction.done &&
    !thinkAction.userBriefing &&
    !thinkAction.toolCalls &&
    !thinkAction.outputNext &&
    !thinkAction.outputDirectly
  );
}

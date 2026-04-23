import { z } from "zod";

export const ToolCallItemSchema = z.object({
  toolName: z.string().describe("Name of the tool"),
  brief: z
    .string()
    .describe(
      "A short one-sentence summary of what this tool call should achieve. Provide the summary in the user's language. The tool's input parameters will be generated separately.",
    ),
  order: z
    .number()
    .int()
    .min(1)
    .max(10)
    .optional()
    .default(1)
    .describe("The order of the tool call in the action flow."),
});

export const ThinkActionSchema = z.discriminatedUnion("actionType", [
  z.object({
    actionType: z.literal("tool-call"),
    statusInstruction: z
      .string()
      .optional()
      .describe(
        "Optional: instructions to immediately show a short user-visible status message before running toolCalls (e.g. 'Searching for information...').",
      ),
    toolCalls: z
      .array(ToolCallItemSchema)
      .optional()
      .default([])
      .describe("Tool call tasks to execute."),
  }),
  z.object({
    actionType: z.literal("output"),
    outputInstruction: z
      .string()
      .describe(
        "Instructions for how the output node should present the content.",
      ),
  }),
  z.object({
    actionType: z.literal("done"),
  }),
]);

export type ThinkAction = z.infer<typeof ThinkActionSchema>;
export type ToolCallItem = z.infer<typeof ToolCallItemSchema>;

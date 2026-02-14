import { z } from "zod";

export const CallToolsActionSchema = z.object({
  type: z.literal("call-tools"),
  toolCalls: z.array(
    z.object({
      toolName: z.string().describe("Name of the tool"),
      brief: z
        .string()
        .describe(
          "A short one-sentence summary of the tool invocation action. Do not include specific parameters here; parameters should be provided in the input field. Provide the summary in the user's language.",
        ),
      input: z
        .any()
        .optional()
        .describe(
          "Input(parameters) for the tool, following the tool's schema",
        ),
    }),
  ),
});

export type CallToolsAction = z.infer<typeof CallToolsActionSchema>;

export const OutputNextActionSchema = z.object({
  type: z.literal("output-next"),
  outputInstruction: z
    .string()
    .describe(
      "Instructions for how the output node should present the content. Only provide guidance and requirements, not the complete output content.",
    ),
});

export const OutputDirectlyActionSchema = z.object({
  type: z.literal("output-directly"),
  outputContent: z
    .string()
    .describe("The complete output content to be displayed to the user."),
});

export type OutputAction = z.infer<typeof OutputNextActionSchema>;

export const SilentActionSchema = z.object({
  type: z.literal("silent"),
});

export const ThinkActionSchema = z.union([
  CallToolsActionSchema,
  OutputNextActionSchema,
  OutputDirectlyActionSchema,
  SilentActionSchema,
]);

export type ThinkAction = z.infer<typeof ThinkActionSchema>;

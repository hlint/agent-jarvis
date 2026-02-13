import { z } from "zod";

export const CallToolsActionSchema = z.object({
  type: z.literal("call-tools"),
  toolCalls: z.array(
    z.object({
      toolName: z.string().describe("Name of the tool"),
      brief: z
        .string()
        .describe(
          "A one-sentence summary of the tool invocation action. Do not include specific parameters here; parameters should be provided in the input field.",
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

export const OutputActionSchema = z.object({
  type: z.literal("output-content"),
  outputInstruction: z
    .string()
    .describe(
      "Instructions for how the output node should present the content. Only provide guidance and requirements, not the complete output content.",
    ),
});

export type OutputAction = z.infer<typeof OutputActionSchema>;

export const SilentActionSchema = z.object({
  type: z.literal("silent"),
});

export const ThinkActionSchema = z.union([
  CallToolsActionSchema,
  OutputActionSchema,
  SilentActionSchema,
]);

export type ThinkAction = z.infer<typeof ThinkActionSchema>;

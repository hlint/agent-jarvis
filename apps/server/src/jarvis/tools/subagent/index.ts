import { tool } from "ai";
import z from "zod";
import type Jarvis from "../..";

const MAX_SESSION_NAME_LENGTH = 100;

export default function createCallSubagentTool(
  jarvis: Jarvis,
  parentSessionId: string,
) {
  return tool({
    description:
      "Delegate a multi-step task to a sub-agent with isolated context (files, web, exec, etc.). See notes/subagent.md for when to use this vs doing the work yourself or using multimodal_subagent.",
    inputSchema: z.object({
      sessionName: z
        .string()
        .min(1)
        .max(MAX_SESSION_NAME_LENGTH)
        .describe(
          "Short title for the subagent session (used in audit logs and recycle bin)",
        ),
      instruction: z
        .string()
        .min(1)
        .describe("Clear task instructions for the subagent"),
    }),
    inputExamples: [
      {
        input: {
          sessionName: "Compare cloud pricing",
          instruction:
            "Search the web for AWS, GCP, and Azure spot instance pricing for 4 vCPU / 16GB in us-east-1. Return a concise comparison table.",
        },
      },
      {
        input: {
          sessionName: "Audit package.json scripts",
          instruction:
            "Read workspace/package.json and all apps/*/package.json. List every npm script and flag duplicates or naming inconsistencies.",
        },
      },
    ],
    execute: async (input) => {
      const result = await jarvis.runner.runSubagent({
        sessionName: input.sessionName,
        instruction: input.instruction,
        parentSessionId,
      });
      return {
        success: result.success,
        error: result.error,
        output: result.output ?? "",
      };
    },
  });
}

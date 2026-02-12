import type z from "zod";

export type AgentTool<INPUT = unknown> = {
  name: string;
  description: string;
  inputSchema: z.ZodSchema<INPUT>;
  execute: (input: INPUT) => Promise<any>;
};

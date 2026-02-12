import type z from "zod";

export type AgentTool<T extends z.ZodSchema = z.ZodSchema> = {
  name: string;
  description: string;
  inputSchema: T;
  execute: (input: z.infer<T>) => Promise<any>;
};

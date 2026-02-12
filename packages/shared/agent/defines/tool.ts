import type z from "zod";

export type Tool<T extends z.ZodSchema> = {
  name: string;
  description: string;
  inputSchema: T;
  execute: (input: z.infer<T>) => Promise<any>;
};

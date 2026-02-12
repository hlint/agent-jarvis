import type z from "zod";

export type Tool = {
  name: string;
  description: string;
  inputSchema: z.ZodSchema;
};

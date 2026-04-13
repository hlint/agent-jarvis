import type z from "zod";

export type AgentTool<INPUT = unknown> = {
  name: string;
  description: string;
  inputSchema: z.ZodSchema<INPUT>;
  execute: (input: INPUT & { content?: string }) => Promise<any>;
  /**
   * When set, composite input is allowed: a fenced json block (short fields), one
   * newline after the closing fence, then plain text merged into `content`.
   * This string describes what that trailing segment is (same logical input).
   */
  inputContentDescription?: string;
};

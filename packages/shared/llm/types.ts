export type LlmDialog = Array<
  | {
      role: "user" | "assistant";
      content: string;
      filePath?: string;
    }
  | {
      role: "system";
      content: string;
    }
>;

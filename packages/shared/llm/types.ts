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

export type AiProvider = {
  model: string;
  apiKey?: string;
  baseURL?: string;
};

export const DEFAULT_WHITEBOARD_PATH = "home.html";

const LLM_TIMEOUT_MS = 120_000; // 120 seconds

// Stream text options for most of the LLMs
export const streamTextOptions = {
  timeout: LLM_TIMEOUT_MS,
  maxRetries: 0,
  allowSystemInMessages: true,
  onError: ({ error }: { error: unknown }) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(errorMessage);
  },
};

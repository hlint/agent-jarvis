export const LLM_TIMEOUT_MS = 40_000; // 40 seconds

export const streamTextOptions = {
  timeout: LLM_TIMEOUT_MS,
  maxRetries: 0,
  onError: ({ error }: { error: unknown }) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(errorMessage);
  },
};

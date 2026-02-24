import type { AiProvider } from "@repo/shared/llm/types";
import { env } from "bun";

// DUTIES: THINK, OUTPUT, MULTIMODALITY, IMAGE_GENERATION

const providers = [1, 2, 3, 4, 5, 6].map((index) => ({
  model: env[`PROVIDER_${index}_MODEL`],
  apiKey: env[`PROVIDER_${index}_API_KEY`],
  baseURL: env[`PROVIDER_${index}_BASE_URL`],
  duties: env[`PROVIDER_${index}_DUTIES`],
}));

function getAiProvider(dutyName: string) {
  return providers.find((t) => t.model && t.duties?.includes(dutyName)) as
    | AiProvider
    | undefined;
}

export const aiThinkProvider = getAiProvider("THINK");
export const aiOutputProvider = getAiProvider("OUTPUT");
export const aiMultimodalityProvider = getAiProvider("MULTIMODALITY");
export const aiImageGenerationProvider = getAiProvider("IMAGE_GENERATION");

import { createAlibaba } from "@ai-sdk/alibaba";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createAzure } from "@ai-sdk/azure";
import { createBlackForestLabs } from "@ai-sdk/black-forest-labs";
import { createByteDance } from "@ai-sdk/bytedance";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createFal } from "@ai-sdk/fal";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createVertex } from "@ai-sdk/google-vertex";
import { createHuggingFace } from "@ai-sdk/huggingface";
import { createOpenAI } from "@ai-sdk/openai";
import { createTogetherAI } from "@ai-sdk/togetherai";
import { createVercel } from "@ai-sdk/vercel";
import { createXai } from "@ai-sdk/xai";
import { createProviderRegistry } from "ai";
import { createMinimax, createMinimaxOpenAI } from "vercel-minimax-ai-provider";

export function getLanguageModel({
  apiKey,
  baseURL,
  model,
}: {
  apiKey?: string;
  baseURL?: string;
  model: string;
}) {
  const providerOptions = {
    apiKey,
    baseURL: baseURL || undefined,
  };
  const registry = createProviderRegistry({
    anthropic: createAnthropic(providerOptions),
    openai: createOpenAI(providerOptions),
    google: createGoogleGenerativeAI(providerOptions),
    xai: createXai(providerOptions),
    vercel: createVercel(providerOptions),
    azure: createAzure(providerOptions),
    "black-forest-labs": createBlackForestLabs(providerOptions),
    fal: createFal(providerOptions),
    vertex: createVertex(providerOptions),
    "together-ai": createTogetherAI(providerOptions),
    "byte-dance": createByteDance(providerOptions),
    deepseek: createDeepSeek(providerOptions),
    "hugging-face": createHuggingFace(providerOptions),
    alibaba: createAlibaba(providerOptions),
    "minimax-openai": createMinimaxOpenAI(providerOptions),
    "minimax-anthropic": createMinimax(providerOptions),
  });

  return registry.languageModel(model as any);
}

export function getImageModel({
  apiKey,
  baseURL,
  model,
}: {
  apiKey?: string;
  baseURL?: string;
  model: string;
}) {
  const providerOptions = {
    apiKey,
    baseURL: baseURL || undefined,
  };
  const registry = createProviderRegistry({
    anthropic: createAnthropic(providerOptions),
    openai: createOpenAI(providerOptions),
    google: createGoogleGenerativeAI(providerOptions),
    xai: createXai(providerOptions),
    vercel: createVercel(providerOptions),
    azure: createAzure(providerOptions),
    blackForestLabs: createBlackForestLabs(providerOptions),
    fal: createFal(providerOptions),
    vertex: createVertex(providerOptions),
    togetherAI: createTogetherAI(providerOptions),
    byteDance: createByteDance(providerOptions),
    deepSeek: createDeepSeek(providerOptions),
    huggingFace: createHuggingFace(providerOptions),
  });
  return registry.imageModel(model as any);
}

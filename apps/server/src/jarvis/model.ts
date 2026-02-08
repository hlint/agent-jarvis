import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { Jarvis } from "./jarvis";

export default function getGeminiModel(jarvis: Jarvis) {
  jarvis.reloadConfig();
  if (!jarvis.config.gemini_api_key || !jarvis.config.gemini_model) {
    throw new Error("Gemini API key or model is not set");
  }
  const google = createGoogleGenerativeAI({
    apiKey: jarvis.config.gemini_api_key,
  });
  return google(jarvis.config.gemini_model);
}

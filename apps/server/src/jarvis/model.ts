import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type Jarvis from "./jarvis";

export default function getGeminiModel(jarvis: Jarvis) {
  jarvis.configManager.reloadConfig();
  const config = jarvis.configManager.getConfig();
  if (!config.gemini_api_key || !config.gemini_model) {
    throw new Error("Gemini API key or model is not set");
  }
  const google = createGoogleGenerativeAI({
    apiKey: config.gemini_api_key,
  });
  return google(config.gemini_model);
}

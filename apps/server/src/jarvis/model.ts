import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { env } from "bun";

export default function getGeminiModel() {
  const config = {
    gemini_api_key: env.GEMINI_API_KEY!,
    gemini_model: env.GEMINI_MODEL!,
  };
  if (!config.gemini_api_key || !config.gemini_model) {
    throw new Error("Gemini API key or model is not set");
  }
  const google = createGoogleGenerativeAI({
    apiKey: config.gemini_api_key,
  });
  return google(config.gemini_model);
}

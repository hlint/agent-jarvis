import { timeFormat } from "@repo/shared/lib/time";
import {
  aiImageGenerationProvider,
  aiMultimodalityProvider,
  aiOutputProvider,
  aiThinkProvider,
} from "../ai-providers";
import { DIR_RUNTIME } from "../defines";
import type Jarvis from "../jarvis";
import { getNotes, getRecentDiaries, getSkills, getSOUL } from "./data-loaders";

export default function buildAgentPrompt(jarvis: Jarvis): string {
  return JSON.stringify(
    {
      environment: {
        currentTime: timeFormat(),
        chatUiWebsiteUrl: jarvis.websiteUrl || "unknown",
        operationSystem: process.platform,
        defaultCwd: DIR_RUNTIME,
        llmProviders: {
          think: aiThinkProvider?.model ?? "Not Set",
          output: aiOutputProvider?.model ?? "Not Set",
          multimodality: aiMultimodalityProvider?.model ?? "Not Set",
          imageGeneration: aiImageGenerationProvider?.model ?? "Not Set",
        },
      },
      soul: getSOUL(),
      cronTasks: jarvis.cron.listCronTasks(),
      skills: getSkills(),
      notes: getNotes(),
      recentDiaries: getRecentDiaries(),
    },
    null,
    2,
  );
}

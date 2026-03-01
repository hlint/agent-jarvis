import { timeFormat } from "@repo/shared/lib/time";
import { DIR_RUNTIME } from "../defines";
import type Jarvis from "../jarvis";
import { getNotes, getRecentDiaries, getSkills, getSOUL } from "./data-loaders";

export default function buildAgentPrompt(jarvis: Jarvis): string {
  return JSON.stringify(
    {
      systemEnvironment: {
        currentTime: timeFormat(),
        chatUiWebsiteUrl: jarvis.websiteUrl || "unknown",
        operationSystem: process.platform,
        defaultCwd: DIR_RUNTIME,
      },
      MySoul: getSOUL(),
      MyCronTasks: jarvis.cron.listCronTasks(),
      MySkills: getSkills(),
      MyNotes: getNotes(),
      MyRecentDiaries: getRecentDiaries(),
    },
    null,
    2,
  );
}

import { timeFormat } from "@repo/shared/lib/time";
import { DIR_RUNTIME } from "../defines";
import type Jarvis from "../jarvis";
import { getLongTermMemory, getRecentDiaries, getSkills } from "./data-loaders";
import { SKILL_INSTRUCTION } from "./skill";

export default function buildAgentPrompt(_jarvis: Jarvis): string {
  return `
Environment: ${JSON.stringify({
    currentTime: timeFormat(),
    currentChannel: "Website with a chat interface",
    chatUiWebsiteUrl: process.env.WEBSITE_URL ?? "unknown",
    defaultCwd: DIR_RUNTIME,
  })}
Agent's Skills: ${JSON.stringify({
    instruction: SKILL_INSTRUCTION,
    currentSkills: getSkills(),
  })}
Agent's Diaries: ${JSON.stringify({
    instruction:
      "Diary is a short-term memory assistant system for the AI, recording the AI's recent progress.",
    recentDiaries: getRecentDiaries(),
  })}
Agent's Long Term Memory: ${JSON.stringify({
    instruction:
      "Long term memory is the information that the AI needs to remember permanently.",
    currentLongTermMemory: getLongTermMemory(),
  })}
`;
}

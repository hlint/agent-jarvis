import type Jarvis from "../jarvis";
import { DIARY_HEADER, getRecentDiaries } from "./diary";
import { getLongTermMemory, MEMORY_HEADER } from "./memory";
import { getSkillSummary, SKILL_HEADER } from "./skill";

export default function buildAgentPrompt(_jarvis: Jarvis): string {
  return `
About Conversation Channel: ${JSON.stringify({
    instruction: "The channel that the user uses to chat with the AI.",
    currentChannel: "Website with a chat interface",
    websiteUrl: process.env.WEBSITE_URL ?? "unknown",
  })}
About Agent's Long Term Memory: ${JSON.stringify({
    instruction: MEMORY_HEADER,
    currentLongTermMemory: getLongTermMemory(),
  })}
About Agent's Skills: ${JSON.stringify({
    instruction: SKILL_HEADER,
    currentSkillSummary: getSkillSummary(),
  })}
About Agent's Diary: ${JSON.stringify({
    instruction: DIARY_HEADER,
    recentDiaries: getRecentDiaries(),
  })}
`;
}

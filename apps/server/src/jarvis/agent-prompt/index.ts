import type Jarvis from "../jarvis";
import { getLongTermMemory, getRecentDiaries, getSkills } from "./data-loaders";
import { SKILL_INSTRUCTION } from "./skill";

export default function buildAgentPrompt(_jarvis: Jarvis): string {
  return `
About Conversation Channel: ${JSON.stringify({
    instruction: "The channel that the user uses to chat with the AI.",
    currentChannel: "Website with a chat interface",
    websiteUrl: process.env.WEBSITE_URL ?? "unknown",
  })}
About Agent's Skills: ${JSON.stringify({
    instruction: SKILL_INSTRUCTION,
    currentSkills: getSkills(),
  })}
About Agent's Diary: ${JSON.stringify({
    instruction:
      "Diary is a short-term memory assistant system for the AI, recording the AI's recent progress.",
    recentDiaries: getRecentDiaries(),
  })}
About Agent's Long Term Memory: ${JSON.stringify({
    instruction:
      "Long term memory is the information that the AI needs to remember permanently.",
    currentLongTermMemory: getLongTermMemory(),
  })}
`;
}

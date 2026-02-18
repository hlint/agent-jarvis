import { timeFormat } from "@repo/shared/lib/time";
import { DIR_RUNTIME } from "../defines";
import type Jarvis from "../jarvis";
import { getLongTermMemory, getRecentDiaries, getSkills } from "./data-loaders";

export default function buildAgentPrompt(_jarvis: Jarvis): string {
  return `
Environment: ${JSON.stringify({
    currentTime: timeFormat(),
    currentChannel: "Website with a chat interface",
    chatUiWebsiteUrl: process.env.WEBSITE_URL ?? "unknown",
    operationSystem: process.platform,
    defaultCwd: DIR_RUNTIME,
  })}

Agent's Skill List: ${JSON.stringify(getSkills())}

Agent's Recent Diaries: ${JSON.stringify(getRecentDiaries())}

Agent's Long Term Memory: ${JSON.stringify(getLongTermMemory())}

`;
}

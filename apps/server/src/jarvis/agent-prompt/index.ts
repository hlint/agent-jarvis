import { timeFormat } from "@repo/shared/lib/time";
import { DIR_RUNTIME } from "../defines";
import type Jarvis from "../jarvis";
import { getNotes, getRecentDiaries, getSkills } from "./data-loaders";

export default function buildAgentPrompt(jarvis: Jarvis): string {
  return `
Environment: ${JSON.stringify({
    instruction: "系统和环境",
    currentTime: timeFormat(),
    chatUiWebsiteUrl: jarvis.websiteUrl || "unknown",
    operationSystem: process.platform,
    defaultCwd: DIR_RUNTIME,
  })}

Agent's Skill List: ${JSON.stringify({
    instruction: "当前技能列表",
    currentSkills: getSkills(),
  })}

Agent's Notes: ${JSON.stringify({
    instruction: "当前笔记",
    currentNotes: getNotes(),
  })}

Agent's Recent Diaries: ${JSON.stringify({
    instruction: "最近 3 天的日记",
    recentDiaries: getRecentDiaries(),
  })}
`;
}

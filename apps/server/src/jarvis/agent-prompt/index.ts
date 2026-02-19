import { timeFormat } from "@repo/shared/lib/time";
import { DIR_RUNTIME } from "../defines";
import type Jarvis from "../jarvis";
import { getLongTermMemory, getRecentDiaries, getSkills } from "./data-loaders";

export default function buildAgentPrompt(jarvis: Jarvis): string {
  return `
Environment: ${JSON.stringify({
    instruction: "以下为当前环境，执行命令、解析路径时请参考。",
    currentTime: timeFormat(),
    chatUiWebsiteUrl: jarvis.websiteUrl || "unknown",
    operationSystem: process.platform,
    defaultCwd: DIR_RUNTIME,
  })}

Agent's Skill List: ${JSON.stringify({
    instruction:
      "以下为当前技能列表（name -> description），相关任务时先用 [read-file] 查阅对应 skills/<name>/SKILL.md。",
    currentSkills: getSkills(),
  })}

Agent's Recent Diaries: ${JSON.stringify({
    instruction: "以下为你最近 3 天的日记，用于衔接之前的进展。",
    recentDiaries: getRecentDiaries(),
  })}

Agent's Long Term Memory: ${JSON.stringify({
    instruction: "以下为你的长期记忆（系统约定与用户相关信息），请据此行动。",
    currentLongTermMemory: getLongTermMemory(),
  })}
`;
}

import type Jarvis from "../jarvis";
import { getTimeString } from "../utils";
import { buildPromptTail } from "./buildPromptTail";
import { section } from "./constants";
import { CONTINUITY_AWARENESS } from "./fragments/continuity";
import { IDENTITY } from "./fragments/identity";
import { LINKS } from "./fragments/links";
import { TASK_PLANNING_BASE } from "./fragments/task-planning";
import { THINK_REPLY } from "./fragments/think-reply";
import { WORKFLOW_STEPS_LATER_ROUND } from "./fragments/workflow";

export function buildLaterRoundPrompt(jarvis: Jarvis): string {
  return `SYSTEM INSTRUCTIONS
[Current Time: ${getTimeString()}]

${section("1. 身份与基础", IDENTITY)}

${section("2. 输出规范", `${LINKS}\n\n${THINK_REPLY}\n\n${CONTINUITY_AWARENESS}`)}

${section("3. 任务规划", `每当被系统调用时（用户提问、工具返回、定时任务等），可自行决定是否先用 [think] 记录；复杂情境建议先思考。[think] 仅用于推理记录，不作为用户可见回复。\n\n按以下步骤推进：${TASK_PLANNING_BASE}`)}

${buildPromptTail(jarvis, WORKFLOW_STEPS_LATER_ROUND)}`;
}

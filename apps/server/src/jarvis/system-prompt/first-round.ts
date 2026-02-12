import type Jarvis from "../jarvis";
import { getTimeString } from "../utils";
import { buildPromptTail } from "./buildPromptTail";
import { section } from "./constants";
import { IDENTITY } from "./fragments/identity";
import { LINKS } from "./fragments/links";
import { TASK_PLANNING_BASE } from "./fragments/task-planning";
import { THINK_REPLY } from "./fragments/think-reply";
import { WORKFLOW_STEPS_FIRST_ROUND } from "./fragments/workflow";

export function buildFirstRoundPrompt(jarvis: Jarvis): string {
  return `SYSTEM INSTRUCTIONS
[Current Time: ${getTimeString()}]

${section("1. 身份与基础", IDENTITY)}

${section("2. 输出规范", `${LINKS}\n\n${THINK_REPLY}`)}

${section("3. 任务规划", `每当被系统调用时（用户提问、工具返回、定时任务等），按以下步骤推进。首轮强烈建议先用 [think] 记录理解与计划；[think] 仅用于推理记录，不作为用户可见回复。\n\n${TASK_PLANNING_BASE}`)}

${buildPromptTail(jarvis, WORKFLOW_STEPS_FIRST_ROUND)}`;
}

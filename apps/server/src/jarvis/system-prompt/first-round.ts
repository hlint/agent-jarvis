import type Jarvis from "../jarvis";
import { getTimeString } from "../utils";
import { buildPromptTail } from "./buildPromptTail";
import { DELIM } from "./constants";
import { IDENTITY } from "./fragments/identity";
import { LINKS } from "./fragments/links";
import { TASK_PLANNING_BASE } from "./fragments/task-planning";
import { THINK_REPLY } from "./fragments/think-reply";
import { WORKFLOW_STEPS_FIRST_ROUND } from "./fragments/workflow";

const FIRST_ROUND_NOTICE =
  "\n■ 首轮强制规则：当前为首轮调用。你只允许调用工具 [think]，不允许调用其他任何工具，不允许输出任何文字。违反即错误。\n";

const THINK_REQUIREMENT_FIRST =
  "本轮（首轮）你只允许做一件事：使用工具 [think] 记录当前情境的理解与下一步计划；禁止调用 [think] 以外的任何工具，禁止输出任何文字。调用 [think] 后本轮即结束，等待系统再次调用。若你判断需要调取某些 SKILL，请在本次 [think] 中记录该需求，并在下一轮首先调用相关技能工具加载指引，再继续使用 [think] 完善规划。";

export function buildFirstRoundPrompt(jarvis: Jarvis): string {
  return `SYSTEM INSTRUCTIONS
[Current Time: ${getTimeString()}]
${DELIM}

${IDENTITY}
${FIRST_ROUND_NOTICE}

${LINKS}

${THINK_REPLY}

■ 任务分析与规划：每当被系统调用时（无论是用户提问、工具返回结果还是定时任务等），${THINK_REQUIREMENT_FIRST} [think] 仅用于记录推理过程，不会作为给用户的最终回复。在此基础上按以下步骤推进：${TASK_PLANNING_BASE}

${buildPromptTail(jarvis, WORKFLOW_STEPS_FIRST_ROUND)}`;
}

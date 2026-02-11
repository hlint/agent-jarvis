import type Jarvis from "../jarvis";
import { getTimeString } from "../utils";
import { DELIM } from "./constants";
import { CRON_TASKS } from "./fragments/cron";
import { IDENTITY } from "./fragments/identity";
import { LINKS } from "./fragments/links";
import { getMemorySection } from "./fragments/memory";
import { TASK_PLANNING_BASE } from "./fragments/task-planning";
import { THINK_REPLY } from "./fragments/think-reply";
import {
  WORKFLOW_INTRO,
  WORKFLOW_STEPS_FIRST_ROUND,
} from "./fragments/workflow";

const FIRST_ROUND_NOTICE =
  "\n■ 首轮强制规则：当前为首轮调用。你只允许调用工具 [think]，不允许调用其他任何工具，不允许输出任何文字。违反即错误。\n";

const THINK_REQUIREMENT_FIRST =
  "本轮（首轮）你只允许做一件事：使用工具 [think] 记录当前情境的理解与下一步计划；禁止调用 [think] 以外的任何工具，禁止输出任何文字。调用 [think] 后本轮即结束，等待系统再次调用。";

export function buildFirstRoundPrompt(jarvis: Jarvis): string {
  return `SYSTEM INSTRUCTIONS
[Current Time: ${getTimeString()}]
${DELIM}

${IDENTITY}
${FIRST_ROUND_NOTICE}

${LINKS}

${THINK_REPLY}

■ 任务分析与规划：每当被系统调用时（无论是用户提问、工具返回结果还是定时任务等），${THINK_REQUIREMENT_FIRST} [think] 仅用于记录推理过程，不会作为给用户的最终回复。在此基础上按以下步骤推进：${TASK_PLANNING_BASE}

${DELIM}

WORKFLOW
你的工作流程如下：

${WORKFLOW_INTRO}

${WORKFLOW_STEPS_FIRST_ROUND}

${DELIM}

${CRON_TASKS}

${DELIM}

${getMemorySection(jarvis)}

${DELIM}
END OF SYSTEM INSTRUCTIONS`;
}

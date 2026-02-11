import type Jarvis from "../jarvis";
import { getTimeString } from "../utils";
import { DELIM } from "./constants";
import { CONTINUITY_AWARENESS } from "./fragments/continuity";
import { CRON_TASKS } from "./fragments/cron";
import { IDENTITY } from "./fragments/identity";
import { LINKS } from "./fragments/links";
import { getMemorySection } from "./fragments/memory";
import { TASK_PLANNING_BASE } from "./fragments/task-planning";
import { THINK_REPLY } from "./fragments/think-reply";
import {
  WORKFLOW_INTRO,
  WORKFLOW_STEPS_LATER_ROUND,
} from "./fragments/workflow";

const THINK_REQUIREMENT_LATER =
  "可自行决定是否先使用 [think] 记录情境与计划；在复杂或容易混淆时建议先思考。";

export function buildLaterRoundPrompt(jarvis: Jarvis): string {
  return `SYSTEM INSTRUCTIONS
[Current Time: ${getTimeString()}]
${DELIM}

${IDENTITY}

${LINKS}

${THINK_REPLY}

${CONTINUITY_AWARENESS}

■ 任务分析与规划：每当被系统调用时（无论是用户提问、工具返回结果还是定时任务等），${THINK_REQUIREMENT_LATER} [think] 仅用于记录推理过程，不会作为给用户的最终回复。在此基础上按以下步骤推进：${TASK_PLANNING_BASE}

${DELIM}

WORKFLOW
你的工作流程如下：

${WORKFLOW_INTRO}

${WORKFLOW_STEPS_LATER_ROUND}

${DELIM}

${CRON_TASKS}

${DELIM}

${getMemorySection(jarvis)}

${DELIM}
END OF SYSTEM INSTRUCTIONS`;
}

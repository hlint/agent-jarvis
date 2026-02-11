import type Jarvis from "../jarvis";
import { DELIM } from "./constants";
import { getMemorySection } from "./fragments/memory";
import { getSkillSection } from "./fragments/skill";
import { WORKFLOW_INTRO } from "./fragments/workflow";

/**
 * 首轮与后续轮共用的提示词尾部：WORKFLOW、CRON、SKILL、MEMORY。
 */
export function buildPromptTail(jarvis: Jarvis, workflowSteps: string): string {
  return `${DELIM}

${WORKFLOW_INTRO}

${workflowSteps}

${DELIM}

${getSkillSection()}

${DELIM}

${getMemorySection(jarvis)}

${DELIM}
END OF SYSTEM INSTRUCTIONS`;
}

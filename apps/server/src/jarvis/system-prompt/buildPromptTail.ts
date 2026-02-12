import type Jarvis from "../jarvis";
import { section } from "./constants";
import { getMemorySection } from "./fragments/memory";
import { getSkillSection } from "./fragments/skill";
import { WORKFLOW_INTRO } from "./fragments/workflow";

/** 首轮与后续轮共用的提示词尾部：工作流程、技能、长期记忆。 */
export function buildPromptTail(jarvis: Jarvis, workflowSteps: string): string {
  return `${section("4. 工作流程", `${WORKFLOW_INTRO}\n\n${workflowSteps}`)}

${section("5. 技能", getSkillSection())}

${section("6. 长期记忆", getMemorySection(jarvis))}

END OF SYSTEM INSTRUCTIONS`;
}

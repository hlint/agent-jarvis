import type { ToolSet } from "ai";
import type Jarvis from ".";
import { isPlanPhase } from "./plan";
import createListCronTasksTool from "./tools/cron";
import createExecTool from "./tools/exec";
import createFileTools from "./tools/file";
import createHeadroomRetrieveTool from "./tools/headroom-retrieve";
import createImageGenerationTool from "./tools/image-generation";
import createMultimodalTool from "./tools/multimodal";
import createNotificationTool from "./tools/notification";
import createSetupPlanTool from "./tools/plan";
import createSessionTools from "./tools/session";
import createCallSubagentTool from "./tools/subagent";
import createWebTools from "./tools/web";
import createWhiteboardTools from "./tools/whiteboard";

function getToolDescription(tool: unknown): string {
  if (
    tool &&
    typeof tool === "object" &&
    "description" in tool &&
    typeof tool.description === "string"
  ) {
    return tool.description.trim();
  }
  return "";
}

export default class JarvisTool {
  private readonly jarvis: Jarvis;
  constructor(jarvis: Jarvis) {
    this.jarvis = jarvis;
  }

  getTools(sessionId: string): ToolSet {
    const session = this.jarvis.session.getSession(sessionId);
    if (!session || isPlanPhase(session)) {
      return createSetupPlanTool(this.jarvis, sessionId);
    }
    return this.getFullTools(sessionId);
  }

  getDisabledToolsPromptForPlanPhase(sessionId: string): string {
    const session = this.jarvis.session.getSession(sessionId);
    if (!session || !isPlanPhase(session)) {
      return "";
    }

    const lines = Object.entries(this.getFullTools(sessionId))
      .filter(([name]) => name !== "setup_plan")
      .map(([name, tool]) => `- **${name}**: ${getToolDescription(tool)}`);

    if (lines.length === 0) {
      return "";
    }

    return `<DISABLED_TOOLS>
The tools below are registered for this session but **temporarily disabled** until \`setup_plan\` succeeds. You may reply with text only to finish without a board; if you call tools this turn, \`setup_plan\` must be first. Use the names and descriptions below when drafting your plan; you cannot invoke them on this loop iteration.

${lines.join("\n")}
</DISABLED_TOOLS>`;
  }

  private getFullTools(sessionId: string): ToolSet {
    const session = this.jarvis.session.getSession(sessionId);
    const isBasic = session?.type === "basic";

    return {
      ...createSetupPlanTool(this.jarvis, sessionId),
      exec: createExecTool(),
      create_notification: createNotificationTool(this.jarvis, sessionId),
      ...(this.jarvis.config.isWithComputer()
        ? { headroom_retrieve: createHeadroomRetrieveTool() }
        : {}),
      ...createFileTools(),
      ...createWebTools(this.jarvis),
      multimodal_subagent: createMultimodalTool(this.jarvis),
      image_generation: createImageGenerationTool(this.jarvis, sessionId),
      ...(isBasic ? createSessionTools(this.jarvis, sessionId) : {}),
      ...(isBasic ? createWhiteboardTools(this.jarvis, sessionId) : {}),
      ...(isBasic
        ? {
            call_subagent: createCallSubagentTool(this.jarvis, sessionId),
            list_cron_tasks: createListCronTasksTool(this.jarvis),
          }
        : {}),
    };
  }
}

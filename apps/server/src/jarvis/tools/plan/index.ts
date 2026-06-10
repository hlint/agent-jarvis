import { type ToolSet, tool } from "ai";
import z from "zod";
import type Jarvis from "../..";
import { setupSessionPlan } from "../../plan";

export default function createSetupPlanTool(
  jarvis: Jarvis,
  sessionId: string,
): ToolSet {
  return {
    setup_plan: tool({
      description:
        "Write or replace the per-turn task board as a markdown list string. Call before other tools when you need tools this turn — other tools unlock only after the first successful setup_plan. Simple questions may be answered with text only (no setup_plan). Call again anytime to revise the plan. Simple tasks may use one bullet; complex tasks list action/verify/cleanup items. Does not block delivery — a living board, not a checklist gate.",
      inputSchema: z.object({
        plan: z
          .string()
          .min(1)
          .describe(
            "Markdown list for this turn. Complex tasks: group by Prepare/Act/Wrap-up/Report with nested bullets; Prepare should include read_file relevant SKILL.md when applicable.",
          ),
      }),
      inputExamples: [
        {
          input: {
            plan: "- **Prepare**\n  - read_file skills/cron/SKILL.md\n  - read workspace/order-api structure\n- **Act**\n  - implement export + cron task\n- **Wrap-up**\n  - read back changes, run tests\n- **Report**\n  - explain cron schedule and curl usage",
          },
        },
        {
          input: {
            plan: "- Convert 80°F to integer °C and reply",
          },
        },
      ],
      execute: async (input) => {
        const session = jarvis.session.getSession(sessionId);
        if (!session) {
          return { success: false, error: `Session ${sessionId} not found` };
        }
        const result = setupSessionPlan(session, input.plan);
        jarvis.session.sessionChanged(sessionId);
        return result;
      },
    }),
  };
}

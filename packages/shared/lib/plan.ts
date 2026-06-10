import type { SessionPlan } from "../defines/plan";

const MAX_PLAN_LENGTH = 4000;

export function normalizePlanContent(content: string):
  | {
      ok: true;
      plan: SessionPlan;
    }
  | {
      ok: false;
      error: string;
    } {
  const plan = content.trim();
  if (!plan) {
    return { ok: false, error: "plan must not be empty" };
  }
  if (plan.length > MAX_PLAN_LENGTH) {
    return {
      ok: false,
      error: `plan is too long (max ${MAX_PLAN_LENGTH} characters)`,
    };
  }
  return { ok: true, plan };
}

export function formatPlanForPrompt(plan: SessionPlan | undefined): string {
  if (!plan) {
    return `<PLAN status="missing">
No task board for this turn yet. You may reply with text only to finish, or call setup_plan first if you need tools this turn (only setup_plan is available until the board is created).
</PLAN>`;
  }

  return `<PLAN status="active">
${plan}
</PLAN>`;
}

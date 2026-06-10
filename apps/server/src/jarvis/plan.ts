import type { Session } from "@repo/shared/defines/session";
import { normalizePlanContent } from "@repo/shared/lib/plan";

export { formatPlanForPrompt } from "@repo/shared/lib/plan";

export function clearSessionPlan(session: Session) {
  session.plan = undefined;
}

export function setupSessionPlan(session: Session, plan: string) {
  const normalized = normalizePlanContent(plan);
  if (!normalized.ok) {
    return { success: false as const, error: normalized.error };
  }

  const replaced = Boolean(session.plan);
  session.plan = normalized.plan;
  return {
    success: true as const,
    replaced,
    summary: replaced
      ? "Task board updated."
      : "Task board created. You may proceed; call setup_plan again to revise if needed.",
  };
}

export function isPlanPhase(session: Session): boolean {
  return !session.plan;
}

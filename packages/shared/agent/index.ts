import { delay } from "es-toolkit";
import type { AgentContext } from "./defines/context";
import processOutputDirectly from "./lib/process-output-directly";
import processOutputNext from "./lib/process-output-next";
import processThinking from "./lib/process-thinking";
import processToolCalling from "./lib/process-tool";
import processUserBriefing from "./lib/process-user-briefing";

export default async function callAgent({
  maxSteps = 32,
  ...props
}: Omit<AgentContext, "lastThinkAction"> & {
  maxSteps?: number;
}): Promise<{
  stoppedReason?: string;
  stoppedBy?: "completed" | "user" | "max-steps-reached" | "error";
}> {
  const context: AgentContext = { ...props };
  let steps = 0;
  while (steps < maxSteps) {
    steps++;
    if (steps >= maxSteps) {
      return {
        stoppedReason:
          "The agent has reached the maximum number of steps and stopped by system. Please ask the user to continue the conversation. (e.g. 'Sorry, I have reached the maximum number of steps. Should I continue?')",
        stoppedBy: "max-steps-reached",
      };
    }
    if (context.abortSignal?.signal === true) {
      return {
        stoppedReason: "The agent's execution has been aborted by user.",
        stoppedBy: "user",
      };
    }
    try {
      const thinkAction = await processThinking(context);
      context.lastThinkAction = thinkAction;
      await processUserBriefing(context);
      await processToolCalling(context);
      await processOutputDirectly(context);
      await processOutputNext(context);
      if (thinkAction.done) {
        break;
      }
    } catch (error) {
      await delay(500);
      return {
        stoppedReason: `Something went wrong: ${error}`,
        stoppedBy: "error",
      };
    }
  }
  return {
    stoppedReason: "The agent has completed its execution.",
    stoppedBy: "completed",
  };
}

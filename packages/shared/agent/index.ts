import type { AgentContext } from "./defines/context";
import type { AgentState } from "./defines/runtime";
import processAbort from "./lib/process-abort";
import processOutput from "./lib/process-output";
import processOverSteps from "./lib/process-over-steps";
import processThinking from "./lib/process-thinking";
import processToolCalling from "./lib/process-tool";

export default async function callAgent({
  maxSteps = 32,
  ...props
}: Omit<AgentContext, "lastThinkAction"> & {
  maxSteps?: number;
}) {
  const context: AgentContext = { ...props };
  let agentState: AgentState = "thinking";
  let steps = 0;
  while (steps < maxSteps) {
    steps++;
    if (steps >= maxSteps) {
      await processOverSteps(context);
      return;
    }
    if (context.abortSignal?.signal === true) {
      await processAbort(context);
      return;
    }
    switch (agentState) {
      case "thinking": {
        const thinkAction = await processThinking(context);
        context.lastThinkAction = thinkAction;
        switch (thinkAction.type) {
          case "call-tools":
            agentState = "tool-calling";
            break;
          case "output-content":
            agentState = "outputting";
            break;
          case "silent":
            agentState = "completed";
            break;
        }
        break;
      }
      case "tool-calling":
        await processToolCalling(context);
        agentState = "thinking";
        break;
      case "outputting":
        await processOutput(context);
        agentState = "completed";
        break;
      case "completed":
        return;
    }
  }
}

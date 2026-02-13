import type { AgentContext } from "./defines/context";
import type { AgentState } from "./defines/runtime";
import processOutput from "./lib/process-output";
import processThinking from "./lib/process-thinking";
import processToolCalling from "./lib/process-tool";

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
  let agentState: AgentState = "thinking";
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
          return {
            stoppedReason: "The agent has completed its execution.",
            stoppedBy: "completed",
          };
      }
    } catch (error) {
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

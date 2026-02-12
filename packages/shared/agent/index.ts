import type { AgentContext } from "./defines/context";
import type { AgentState } from "./defines/runtime";
import processThinking from "./lib/process-thinking";
import processToolCalling from "./lib/process-tool";

export default async function callAgent(
  params: Omit<AgentContext, "lastThinkAction">,
) {
  const context: AgentContext = {
    ...params,
  };
  let agentState: AgentState = "thinking";
  while (true) {
    switch (agentState) {
      case "thinking": {
        const thinkAction = await processThinking(context);
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
        break;
      case "completed":
        return;
    }
  }
}

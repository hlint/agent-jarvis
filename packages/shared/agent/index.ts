import type { AgentContext } from "./defines/context";
import type { AgentState } from "./defines/runtime";
import processThinking from "./lib/process-thinking";

export default async function callAgent({
  tools = [],
  llmModel,
  llmApiKey,
  llmBaseUrl,
  additionalThinkingInformation = "",
  dialogHistory = [],
  onDialogHistoryChange = () => {},
}: AgentContext) {
  const context: AgentContext = {
    tools,
    dialogHistory,
    additionalThinkingInformation,
    llmModel,
    llmApiKey,
    llmBaseUrl,
    onDialogHistoryChange,
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
        break;
      case "outputting":
        break;
      case "completed":
        return;
    }
  }
}

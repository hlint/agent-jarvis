import type { AiProvider } from "../../llm/types";
import type { DialogHistory } from "./history";
import type { ThinkAction } from "./think-action";
import type { AgentTool } from "./tool";

export type AgentContext = {
  thinkProvider: AiProvider;
  outputProvider?: AiProvider;
  providerOptions?: Record<string, any>;
  tools: AgentTool[];
  dialogHistory: DialogHistory;
  additionalAgentInformation: string;
  thinkingRequirements?: string;
  thinkingExample?: string;
  lastThinkAction?: ThinkAction;
  abortSignal?: {
    signal?: boolean;
  };
  onDialogHistoryChange: () => void;
};

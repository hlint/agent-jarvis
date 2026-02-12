import type { DialogHistory } from "./history";
import type { ThinkAction } from "./think-action";
import type { AgentTool } from "./tool";

export type AgentContext = {
  llmModel: string;
  llmApiKey: string;
  llmBaseUrl?: string;
  tools: AgentTool[];
  dialogHistory: DialogHistory;
  additionalAgentInformation: string;
  lastThinkAction?: ThinkAction;
  abortSignal?: {
    signal?: boolean;
  };
  onDialogHistoryChange: () => void;
};

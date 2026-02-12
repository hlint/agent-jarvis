import type { DialogHistory } from "./history";
import type { Tool } from "./tool";

export type AgentContext = {
  llmModel: string;
  llmApiKey: string;
  llmBaseUrl?: string;
  tools: Tool[];
  dialogHistory: DialogHistory;
  additionalThinkingInformation: string;
  onDialogHistoryChange: () => void;
};

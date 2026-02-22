import type { AiProvider } from "../../llm/types";
import type { DialogHistory } from "./history";
import type { ThinkAction } from "./think-action";
import type { AgentTool } from "./tool";

export type AgentContext = {
  thinkProvider: AiProvider;
  outputProvider?: AiProvider;
  tools: AgentTool[];
  dialogHistory: DialogHistory;
  additionalAgentInformation: string;
  lastThinkAction?: ThinkAction;
  abortSignal?: {
    signal?: boolean;
  };
  onDialogHistoryChange: () => void;
};

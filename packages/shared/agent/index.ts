import { delay } from "es-toolkit";
import z from "zod";
import { timeFormat } from "../lib/time";
import { shortId } from "../lib/utils";
import type { AgentContext } from "./defines/context";
import type { HistoryEntry } from "./defines/history";
import processOutput from "./lib/process-output";
import processThinking from "./lib/process-thinking";
import processToolCalling from "./lib/process-tool";

const StopByUserErrorSchema = z.object({
  stoppedReason: z.string(),
  stoppedBy: z.literal("user"),
});

type StopByUserError = z.infer<typeof StopByUserErrorSchema>;

export default async function callAgent({
  maxSteps = 32,
  ...props
}: Omit<AgentContext, "lastThinkAction"> & {
  maxSteps?: number;
}): Promise<{
  stoppedReason?: string;
  stoppedBy?: "completed" | "user" | "max-steps-reached" | "error";
}> {
  const context: AgentContext = {
    ...props,
  };
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
    const checkAbort = () => {
      if (context.abortSignal?.signal === true) {
        throw {
          stoppedReason: "The agent's execution has been aborted by user.",
          stoppedBy: "user",
        } satisfies StopByUserError;
      }
    };
    try {
      checkAbort();
      const thinkAction = await processThinking(context);
      context.lastThinkAction = thinkAction;
      checkAbort();
      if (thinkAction.actionType === "tool-call") {
        await processToolCalling(context);
      }
      if (thinkAction.actionType === "output") {
        await processOutput(context);
      }
      if (thinkAction.actionType === "done") {
        if (thinkAction.finalMessage != null && thinkAction.finalMessage !== "") {
          const entry: HistoryEntry = {
            id: shortId(),
            role: "agent-reply",
            status: "completed",
            createdTime: timeFormat(),
            createdAt: Date.now(),
            content: thinkAction.finalMessage,
          };
          context.dialogHistory.push(entry);
          context.onDialogHistoryChange();
        }
        break;
      }
      checkAbort();
    } catch (error) {
      await delay(500);
      const errorParsed = StopByUserErrorSchema.safeParse(error);
      if (errorParsed.success) {
        return errorParsed.data;
      }
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

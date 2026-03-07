import callAgent from "@repo/shared/agent/index";
import { timeFormat } from "@repo/shared/lib/time";
import { shortId } from "@repo/shared/lib/utils";
import buildAgentPrompt from "./agent-prompt";
import { thinkingExample } from "./agent-prompt/thinking-example";
import { thinkingRequirements } from "./agent-prompt/thinking-requirements";
import type Jarvis from "./jarvis";
import { builtInTools, createAiTools } from "./tool";

const MAX_RETRY_COUNT = 3;

/**
 * Runner executes the core loop of AI conversation:
 * message flow, tool calls, and state management.
 */
export default class Runner {
  private jarvis: Jarvis;
  private busy: boolean = false; // Whether currently executing
  private needRunNext: boolean = false; // Whether to continue next round
  private abortSignal: { signal: boolean } = { signal: false };

  constructor(jarvis: Jarvis) {
    this.jarvis = jarvis;
  }

  /**
   * Run one round of AI conversation:
   * send messages, receive response, handle tool calls, update state.
   */
  private async run() {
    // Prevent duplicate execution
    if (this.busy) return;
    this.busy = true;
    this.jarvis.updateChatStatus("running");
    this.needRunNext = false;
    const dialogHistory = this.jarvis.state.getState().dialogHistory;
    const chatProvider = this.jarvis.config.getAiProvider("CHAT");
    if (!chatProvider) {
      throw new Error("No think provider found");
    }
    // Call AI Agent
    const abortSignal = {
      signal: false,
    };
    this.abortSignal = abortSignal;
    const { stoppedReason, stoppedBy } = await callAgent({
      thinkProvider: chatProvider,
      outputProvider: chatProvider,
      tools: createAiTools(builtInTools, this.jarvis),
      dialogHistory,
      additionalAgentInformation: await buildAgentPrompt(this.jarvis),
      thinkingRequirements,
      thinkingExample,
      abortSignal,
      onDialogHistoryChange: () => {
        this.jarvis.notifyDialogHistoryChanged();
      },
    });

    switch (stoppedBy) {
      case "completed":
        break;
      case "user":
        this.jarvis.pushHistoryEntry({
          id: shortId(),
          role: "system-event",
          createdTime: timeFormat(),
          createdAt: Date.now(),
          brief: "Aborted.",
          content: "The agent's execution has been aborted by user.",
        });
        break;
      case "max-steps-reached":
        this.jarvis.pushHistoryEntry({
          id: shortId(),
          role: "system-event",
          createdTime: timeFormat(),
          createdAt: Date.now(),
          brief: "Maximum steps reached.",
          content:
            'The agent has reached the maximum number of steps and stopped by system. Please ask the user to continue the conversation. (e.g. "Sorry, I have reached the maximum number of steps. Should I continue?")',
        });
        break;
      case "error":
        if (this.jarvis.retryCount < MAX_RETRY_COUNT) {
          this.jarvis.retryCount++;
          this.jarvis.pushHistoryEntry({
            id: shortId(),
            role: "system-event",
            createdTime: timeFormat(),
            createdAt: Date.now(),
            brief: `Runtime Error, Retrying... (Attempt ${this.jarvis.retryCount}/${MAX_RETRY_COUNT})`,
            content: "Something went wrong during the agent execution.",
            error: stoppedReason,
          });
          this.needRunNext = true;
        } else {
          this.jarvis.pushHistoryEntry({
            id: shortId(),
            role: "system-event",
            createdTime: timeFormat(),
            createdAt: Date.now(),
            brief: "Runtime Error, Maximum retries reached.",
            content:
              "Something went wrong and cannot be recovered by AI Agent, wait for user to continue.",
            error: stoppedReason,
          });
          this.needRunNext = false;
        }
        break;
    }

    // Release lock
    this.busy = false;
    this.jarvis.updateChatStatus("idle");
    // If needed, continue to next round
    if (this.needRunNext) {
      this.run();
    }
  }

  stop() {
    this.abortSignal.signal = true;
  }

  /**
   * Trigger next round of execution.
   * Used externally (e.g. when a new user message arrives) to start a new conversation turn.
   */
  runNext() {
    this.needRunNext = true;
    this.run();
  }
}

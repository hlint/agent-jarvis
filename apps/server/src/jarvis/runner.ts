import callAgent from "@repo/shared/agent/index";
import { timeFormat } from "@repo/shared/lib/time";
import { shortId } from "@repo/shared/lib/utils";
import { env } from "bun";
import buildAgentPrompt from "./agent-prompt";
import type Jarvis from "./jarvis";
import { builtInTools, createAiTools } from "./tool";

const MAX_RETRY_COUNT = 3;

/**
 * Runner 负责执行 AI 对话的核心循环逻辑
 * 处理消息流、工具调用和状态管理
 */
export default class Runner {
  private jarvis: Jarvis;
  private busy: boolean = false; // 是否正在执行中
  private needRunNext: boolean = false; // 是否需要继续执行下一轮

  constructor(jarvis: Jarvis) {
    this.jarvis = jarvis;
  }

  /**
   * 执行一轮 AI 对话
   * 包括：发送消息、接收响应、处理工具调用、更新状态
   */
  private async run() {
    // 防止重复执行
    if (this.busy) return;
    this.busy = true;
    this.needRunNext = false;
    const dialogHistory = this.jarvis.state.getState().dialogHistory;

    // 调用 AI 对话
    const { stoppedReason, stoppedBy } = await callAgent({
      llmModel: env.LLM_MODEL!,
      llmApiKey: env.LLM_API_KEY!,
      llmBaseUrl: env.LLM_BASE_URL,
      tools: createAiTools(builtInTools, this.jarvis),
      dialogHistory,
      additionalAgentInformation: buildAgentPrompt(this.jarvis),
      onDialogHistoryChange: () => {
        this.jarvis.notifyStateChanged();
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
          brief: "Aborted.",
          content: "The agent's execution has been aborted by user.",
        });
        break;
      case "max-steps-reached":
        this.jarvis.pushHistoryEntry({
          id: shortId(),
          role: "system-event",
          createdTime: timeFormat(),
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
            brief: "Runtime Error, Maximum retries reached.",
            content:
              "Something went wrong and cannot be recovered by AI Agent, wait for user to continue.",
            error: stoppedReason,
          });
          this.needRunNext = false;
        }
        break;
    }

    // 释放锁
    this.busy = false;

    // 如果需要，继续执行下一轮
    if (this.needRunNext) {
      this.run();
    }
  }

  /**
   * 触发下一轮执行
   * 用于外部（如用户新消息进来后）触发新的对话轮次
   */
  runNext() {
    this.needRunNext = true;
    this.run();
  }
}

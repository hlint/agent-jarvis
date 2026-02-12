import callAgent from "@repo/shared/agent/index";
import { timeFormat } from "@repo/shared/lib/time";
import { shortId } from "@repo/shared/lib/utils";
import { env } from "bun";
import type Jarvis from "./jarvis";
import { builtInTools, createAiTools } from "./tool";
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
    await callAgent({
      llmModel: env.LLM_MODEL!,
      llmApiKey: env.LLM_API_KEY!,
      llmBaseUrl: env.LLM_BASE_URL,
      tools: createAiTools(builtInTools, this.jarvis),
      dialogHistory,
      additionalAgentInformation: "",
      onDialogHistoryChange: () => {
        this.jarvis.state.notifyStateChanged();
      },
    }).catch((error) => {
      dialogHistory.push({
        id: shortId(),
        role: "system-event",
        createdTime: timeFormat(),
        content: "Something went wrong, please try again later.",
        error: error instanceof Error ? error.message : String(error),
      });
      this.jarvis.state.notifyStateChanged();
    });

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

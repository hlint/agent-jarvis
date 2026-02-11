import type {
  ActionRoundChatEvent,
  AssistantChatEvent,
} from "@repo/shared/defines/chat-event";
import { generateText, streamText, tool } from "ai";
import { nanoid } from "nanoid";
import z from "zod";
import { chatEventsToModelMessages } from "./format";
import type Jarvis from "./jarvis";
import getGeminiModel from "./model";
import systemPromptBuilder from "./system-prompt";
import { builtInTools, createAiTools } from "./tool";
import { getTimeString, stripSystemFormatPrefixes } from "./utils";

const MAX_ROUNDS = 32; // 最大轮次，超过该轮次后，系统会强制停止
const WARNING_ROUND = 30; // 警告轮次，超过该轮次后，AI 会停止并提示用户

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

    // 步骤数
    let step = 0;

    // 创建动作轮次事件
    const actionRoundChatEvent: ActionRoundChatEvent = {
      id: nanoid(6),
      role: "action-round",
      time: Date.now(),
      round: 0,
      pending: true,
    };
    this.jarvis.state.addChatEvent(actionRoundChatEvent);

    while (step < MAX_ROUNDS) {
      // 更新步骤数
      step++;
      actionRoundChatEvent.round = step;
      actionRoundChatEvent.time = Date.now();
      this.jarvis.state.notifyStateChanged();

      // 警告轮次
      if (step >= WARNING_ROUND) {
        // 引导AI发出需要用户确认再继续的提示
        this.jarvis.state.addChatEvent({
          id: nanoid(6),
          role: "assistant",
          time: Date.now(),
          content:
            "Sorry, I have reached the maximum number of rounds. Please confirm to continue or wait for a new request.",
          pending: false,
        });
        this.busy = false;
        this.needRunNext = false;
        actionRoundChatEvent.pending = false;
        this.jarvis.state.notifyStateChanged();
        return;
      }

      // 状态标记
      let replyPushed = false; // 是否已推送回复到聊天记录
      let toolCalled = false; // 是否调用了工具
      let doNothing = false; // 是否什么都不做

      const chatEvents = this.jarvis.state.getChatEvents();

      // 创建助手回复事件
      const assistantChatEvent: AssistantChatEvent = {
        id: nanoid(6),
        role: "assistant",
        time: Date.now(),
        content: "",
        pending: true,
      };
      try {
        const isFirstRound = step <= 1;
        const model = getGeminiModel();

        // 构建流式文本生成请求
        const { fullStream } = streamText({
          model,
          messages: [
            {
              role: "system",
              content: systemPromptBuilder(this.jarvis, isFirstRound),
            },
            ...chatEventsToModelMessages(this.jarvis.state.getChatEvents()),
          ],
          // onError: () => {}, // 覆盖默认的 console.error 打印
          tools: {
            "do-nothing": tool({
              description:
                "Call this tool to indicate that you have nothing to do for now. No output will be generated. No other tools will be called.",
              inputSchema: z.object({}),
            }),
            think: {} as any, // TypeScript 类型检查 hack，满足 toolChoice 的类型要求
            ...createAiTools(builtInTools, this.jarvis),
          },
          toolChoice: "auto",
        });

        // 处理流式响应
        for await (const streamPart of fullStream) {
          switch (streamPart.type) {
            case "text-delta":
              // 处理文本增量更新
              assistantChatEvent.content += streamPart.text;
              assistantChatEvent.time = Date.now();
              if (replyPushed) {
                // 已推送过，仅通知状态更新
                this.jarvis.state.notifyStateChanged();
              } else {
                // 首次推送回复事件
                replyPushed = true;
                this.jarvis.state.addChatEvent(assistantChatEvent);
              }
              break;

            case "tool-input-start":
              // 处理工具调用
              if (
                streamPart.toolName === "do-nothing" ||
                streamPart.toolName === "request-confirmation"
              ) {
                doNothing = true;
              } else {
                toolCalled = true;
              }
              if (streamPart.toolName !== "do-nothing") {
                this.jarvis.state.addChatEvent({
                  id: streamPart.id,
                  role: "tool-call",
                  time: Date.now(),
                  toolName: streamPart.toolName,
                  brief: "-",
                  toolInput: null,
                  toolOutput: null,
                  pending: true,
                });
              }
              break;
          }
        }
      } catch (error) {
        // 捕获并处理错误
        assistantChatEvent.content = `Something went wrong: ${error}`;
        doNothing = false;
      }
      // 完成回复处理
      assistantChatEvent.time = Date.now();
      assistantChatEvent.pending = false;

      if (!replyPushed && assistantChatEvent.content) {
        // 如果之前未推送但有内容，现在推送
        this.jarvis.state.addChatEvent(assistantChatEvent);
        replyPushed = true;
      } else if (replyPushed) {
        // 如果已推送，清理系统格式前缀
        const { strippedText, removedPrefixCount } = stripSystemFormatPrefixes(
          assistantChatEvent.content,
        );
        if (removedPrefixCount > 0) {
          assistantChatEvent.content = strippedText;
        }
      }

      // 判断是否什么都没做（既没调用工具也没输出文字）
      doNothing = doNothing || (!toolCalled && !replyPushed);

      if (doNothing) {
        // 如果什么都没做，移除助手回复事件
        const index = chatEvents.findIndex(
          (e) => e.id === assistantChatEvent.id,
        );
        if (index !== -1) {
          chatEvents.splice(index, 1);
        }
        // 什么都不做，退出循环
        break;
      } else if (!toolCalled) {
        // 需要检查是否需要继续执行
        const shouldContinue = await this.checkIfShouldContinue();
        if (!shouldContinue) {
          break;
        }
      }

      // 通知状态变更
      this.jarvis.state.notifyStateChanged();
    }

    // 完成动作轮次
    actionRoundChatEvent.pending = false;
    actionRoundChatEvent.time = Date.now();
    this.jarvis.state.notifyStateChanged();
    this.busy = false;

    // 如果需要，递归执行下一轮
    if (this.needRunNext) {
      this.run();
    }
  }

  /**
   * 触发下一轮执行
   * 用于外部（如工具结果返回后）触发新的对话轮次
   */
  runNext() {
    this.needRunNext = true;
    this.run();
  }

  private async checkIfShouldContinue(): Promise<boolean> {
    const model = getGeminiModel();
    const { text } = await generateText({
      model,
      system: `
You are a context checker. Review the conversation and long-term memory, then determine whether a follow-up AI call is needed.

Reply in this format:
1. 先分析当前对话与上下文
2. 再给出结论（简要中文）
3. 最后以 YES 或 NO 结尾

Example (YES):
分析：助手在上一轮说「我现在就来修改并执行脚本」，但该轮未调用任何工具。
结论：需继续一轮，给助手机会执行承诺的操作。
YES

Example (NO):
分析：助手已完整回答了用户问题，无待办任务，且未承诺后续动作。
结论：任务已完成，等待用户下一步。
NO

Current Time: ${getTimeString()}

------------------------ END OF LONG-TERM MEMORY ------------------------

Return YES if:
- The assistant explicitly said it would take action (e.g. "I will now...", "我现在就来...", "下一步...") but the last turn shows no tool was called
- There are pending tasks, tool calls, or actions the assistant indicated it would do but hasn't done
- The user's question or request is not fully addressed
- Long-term memory contains special agreements that imply more action is needed

Return NO if:
- The assistant's last response fully completed the task
- There is nothing more to do; the assistant is waiting for user input
- The response was a final answer with no implied follow-up`,
      messages: [
        {
          role: "user",
          content: `Here is the conversation and long-term memory: ${JSON.stringify(
            {
              longTermMemory: this.jarvis.memory.getLongTermMemory(),
              conversation: this.jarvis.state.getChatEvents(),
            },
          )}`,
        },
      ],
    });

    const trimmed = text.trim();
    // console.debug("[checkIfShouldContinue] full response:", trimmed);
    const hasYes = trimmed.includes("YES");
    // const hasNo = trimmed.includes("NO");
    const isYes = hasYes;
    return isYes;
  }
}

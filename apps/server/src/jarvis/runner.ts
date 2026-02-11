import type {
  ActionRoundChatEvent,
  AssistantChatEvent,
} from "@repo/shared/defines/chat-event";
import { streamText, tool } from "ai";
import { nanoid } from "nanoid";
import z from "zod";
import { chatEventsToModelMessages } from "./format";
import type Jarvis from "./jarvis";
import getGeminiModel from "./model";
import systemPromptBuilder from "./system-prompt";
import { builtInTools, createAiTools } from "./tool";
import { stripSystemFormatPrefixes } from "./utils";

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

    while (step < 24) {
      // 更新步骤数
      step++;
      actionRoundChatEvent.round = step;
      actionRoundChatEvent.time = Date.now();
      this.jarvis.state.notifyStateChanged();

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
          onError: () => {}, // 覆盖默认的 console.error 打印
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

            case "tool-call":
              // 处理工具调用
              if (streamPart.toolName === "do-nothing") {
                doNothing = true;
              } else {
                toolCalled = true;
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
        // 没有调用工具，添加双重检查事件（让AI自我检查是否需要继续执行）
        this.jarvis.state.addChatEvent({
          id: nanoid(6),
          role: "double-check",
          time: Date.now(),
        });
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
}

import type { AssistantChatEvent } from "@repo/shared/defines/chat-event";
import { streamText } from "ai";
import { nanoid } from "nanoid";
import { chatEventsToModelMessages } from "./format";
import type Jarvis from "./jarvis";
import getGeminiModel from "./model";
import systemPromptBuilder from "./system-prompt-builder";
import { builtInTools, createAiTools } from "./tool";
import { stripSystemFormatPrefixes } from "./utils";

export default class Runner {
  private jarvis: Jarvis;
  private busy: boolean = false;
  private needRunNext: boolean = false;

  constructor(jarvis: Jarvis) {
    this.jarvis = jarvis;
  }

  private async run() {
    if (this.busy) return;
    this.busy = true;
    this.needRunNext = false;
    let assistantChatEventPushed = false;
    const assistantChatEvent: AssistantChatEvent = {
      id: nanoid(6),
      role: "assistant",
      time: Date.now(),
      content: "",
      pending: true,
    };
    try {
      const model = getGeminiModel();
      const { fullStream } = streamText({
        model,
        messages: [
          {
            role: "system",
            content: systemPromptBuilder(this.jarvis),
          },
          ...chatEventsToModelMessages(this.jarvis.state.getChatEvents()),
        ],
        onError: () => {}, // 覆盖默认的 console.error 打印
        tools: createAiTools(builtInTools, this.jarvis),
        toolChoice: "auto",
      });
      for await (const streamPart of fullStream) {
        switch (streamPart.type) {
          case "text-delta":
            assistantChatEvent.content += streamPart.text;
            assistantChatEvent.time = Date.now();
            if (assistantChatEventPushed) {
              this.jarvis.state.notifyStateChanged();
            } else {
              assistantChatEventPushed = true;
              this.jarvis.state.addChatEvent(assistantChatEvent);
            }
            break;
        }
      }
    } catch (error) {
      assistantChatEvent.content = `Something went wrong: ${error}`;
    }
    assistantChatEvent.time = Date.now();
    assistantChatEvent.pending = false;
    if (!assistantChatEventPushed && assistantChatEvent.content) {
      assistantChatEventPushed = true;
      this.jarvis.state.addChatEvent(assistantChatEvent);
    } else if (assistantChatEventPushed) {
      const { strippedText, removedPrefixCount } = stripSystemFormatPrefixes(
        assistantChatEvent.content,
      );
      if (removedPrefixCount > 0) {
        assistantChatEvent.content = strippedText;
        this.jarvis.state.notifyStateChanged();
      }
    }
    this.busy = false;
    if (!assistantChatEventPushed) {
      this.needRunNext = true;
    }
    if (this.needRunNext) {
      this.run();
    }
  }

  runNext() {
    this.needRunNext = true;
    this.run();
  }
}

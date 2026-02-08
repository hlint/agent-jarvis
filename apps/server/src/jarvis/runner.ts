import { streamText } from "ai";
import type { Jarvis } from "./jarvis";
import getGeminiModel from "./model";

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
    try {
      this.jarvis.clientManager.pushWebSocketMessage({
        type: "reply-stream-start",
      });
      const model = getGeminiModel(this.jarvis);
      const { fullStream, text: fullText } = streamText({
        model,
        messages: this.jarvis.messages,
        onError: () => {}, // 覆盖默认的 console.error 打印
      });
      for await (const streamPart of fullStream) {
        switch (streamPart.type) {
          case "text-delta":
            this.jarvis.clientManager.pushWebSocketMessage({
              type: "reply-stream-delta",
              payload: streamPart.text,
            });
            break;
        }
      }
      this.jarvis.bus.pushMessage({
        role: "assistant",
        content: await fullText,
      });
    } catch (error) {
      const errorMessage = (error as Error)?.message || "";
      console.error(`Error in Runner.run() ${errorMessage}`);
      if (errorMessage) {
        this.jarvis.bus.pushMessage({
          role: "assistant",
          content: `Something went wrong: ${errorMessage}`,
        });
      } else {
        console.error(error);
      }
    }
    this.busy = false;
    if (this.needRunNext) {
      this.run();
    }
  }

  runNext() {
    this.needRunNext = true;
    this.run();
  }
}

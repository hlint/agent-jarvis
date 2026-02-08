import type { ModelMessage } from "ai";
import type { Jarvis } from "./jarvis";
import { toClientMessage } from "./utils";

export default class Bus {
  private jarvis: Jarvis;

  constructor(jarvis: Jarvis) {
    this.jarvis = jarvis;
  }

  pushMessage(message: ModelMessage) {
    this.jarvis.messages.push(message);
    // 判断是否需要runNext
    if (message.role === "user") {
      this.jarvis.runner.runNext();
    }
    // 判断是否需要推送到客户端
    if (message.role === "user" || message.role === "assistant") {
      const clientMessage = toClientMessage(message);
      if (clientMessage) {
        this.jarvis.clientManager.pushWebSocketMessage({
          type: "message",
          payload: clientMessage,
        });
      }
    }
  }
}

import { type AgentConfig, AgentConfigSchema } from "@repo/shared/defines";
import type { ModelMessage, UserModelMessage } from "ai";
import fs from "fs-extra";
import Bus from "./bus";
import JarvisClientManager from "./client-manager";
import { PATH_CONFIG } from "./defines";
import init from "./init";
import Runner from "./runner";

export class Jarvis {
  public messages: ModelMessage[] = [
    {
      role: "assistant",
      content:
        "Hi, I'm Jarvis, your personal assistant. How can I help you today?",
    },
  ];
  public config: AgentConfig = {
    gemini_model: "",
    gemini_api_key: "",
  };
  public bus = new Bus(this);
  public runner = new Runner(this);
  public clientManager = new JarvisClientManager();

  constructor() {
    init(this);
  }

  reloadConfig() {
    try {
      const config = AgentConfigSchema.parse(fs.readJSONSync(PATH_CONFIG));
      this.config = config;
    } catch (_error) {
      fs.writeJSONSync(PATH_CONFIG, this.config, { spaces: 2 });
    }
  }

  input(message: UserModelMessage) {
    this.bus.pushMessage(message);
  }

  clearMessages() {
    this.messages = [];
    this.clientManager.pushWebSocketMessage({
      type: "clear-messages",
    });
  }
}

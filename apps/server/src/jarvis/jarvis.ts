import { nanoid } from "nanoid";
import JarvisClientManager from "./client";
import JarvisConfigManager from "./config";
import init from "./init";
import Runner from "./runner";
import { JarvisState } from "./state";

export default class Jarvis {
  public runner = new Runner(this);
  public clientManager = new JarvisClientManager();
  public state = new JarvisState(this);
  public configManager = new JarvisConfigManager();

  constructor() {
    init(this);
  }

  incomingUserMessage(content: string) {
    this.state.addChatEvent({
      role: "user",
      content: content,
      time: Date.now(),
      id: nanoid(6),
    });
    this.runner.runNext();
  }

  clearChatEvents() {
    this.state.setState({
      snapshotId: nanoid(6),
      chatEvents: [],
    });
    this.state.notifyStateChanged();
  }
}

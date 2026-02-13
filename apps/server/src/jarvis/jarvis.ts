import { timeFormat } from "@repo/shared/lib/time";
import { nanoid } from "nanoid";
import JarvisClientManager from "./client";
import JarvisCron from "./cron";
import init from "./init";
import JarvisMemory from "./memory";
import Runner from "./runner";
import { JarvisStateManager } from "./state";

export default class Jarvis {
  public runner = new Runner(this);
  public clientManager = new JarvisClientManager();
  public state = new JarvisStateManager(this);
  public memory = new JarvisMemory();
  public cron = new JarvisCron(this);
  public retryCount = 0;

  constructor() {
    init(this);
  }

  incomingUserMessage(content: string) {
    this.state.newHistoryEntry({
      id: nanoid(6),
      role: "user",
      createdTime: timeFormat(),
      content: content,
    });
    this.retryCount = 0;
    this.runner.runNext();
  }

  clearDialog() {
    this.state.setState({
      snapshotId: nanoid(6),
      dialogHistory: [],
    });
    this.state.notifyStateChanged();
  }
}

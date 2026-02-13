import type { HistoryEntry } from "@repo/shared/agent/defines/history";
import { timeFormat } from "@repo/shared/lib/time";
import { debounce } from "es-toolkit";
import { nanoid } from "nanoid";
import JarvisClientManager from "./client";
import JarvisCron from "./cron";
import init from "./init";
import Runner from "./runner";
import { JarvisStateManager } from "./state";

export default class Jarvis {
  public runner = new Runner(this);
  public clientManager = new JarvisClientManager();
  public state = new JarvisStateManager(this);
  public cron = new JarvisCron(this);
  public retryCount = 0;
  private pushInactiveEvent = debounce(() => {
    const dialogHistory = this.state.getState().dialogHistory;
    const lastEntry = dialogHistory[dialogHistory.length - 1];
    const secondLastEntry = dialogHistory[dialogHistory.length - 2];

    // 如果最后一条和倒数第二条都是静默状态，说明AI已经认为不需要做任何事了，此时不需要唤醒
    if (
      lastEntry?.role === "agent-thinking" &&
      lastEntry?.action?.type === "silent" &&
      secondLastEntry?.role === "system-event" &&
      secondLastEntry?.data?.type === "system-inactive"
    ) {
      return;
    }

    this.pushHistoryEntry({
      id: nanoid(6),
      role: "system-event",
      createdTime: timeFormat(),
      brief: "System Inactive",
      content: "The system has been inactive for 5 minutes.",
      status: "completed",
      data: {
        type: "system-inactive",
      },
    });
    this.wakeUp();
  }, 5 * 60_000);

  constructor() {
    init(this);
  }

  incomingUserMessage(content: string) {
    this.pushHistoryEntry({
      id: nanoid(6),
      role: "user",
      createdTime: timeFormat(),
      content: content,
    });
    this.retryCount = 0;
    this.wakeUp();
  }

  wakeUp() {
    this.runner.runNext();
  }

  pushHistoryEntry(historyEntry: HistoryEntry) {
    this.state.getState().dialogHistory.push(historyEntry);
    this.notifyStateChanged();
  }

  notifyStateChanged() {
    this.pushInactiveEvent();
    this.state.pushDiff();
  }

  clearDialog() {
    this.state.setState({
      snapshotId: nanoid(6),
      dialogHistory: [],
    });
    this.notifyStateChanged();
  }
}

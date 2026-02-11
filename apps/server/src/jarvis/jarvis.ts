import type { RequestConfirmationChatEvent } from "@repo/shared/defines/chat-event";
import { nanoid } from "nanoid";
import JarvisClientManager from "./client";
import JarvisCron from "./cron";
import init from "./init";
import JarvisMemory from "./memory";
import Runner from "./runner";
import { JarvisState } from "./state";

export default class Jarvis {
  public runner = new Runner(this);
  public clientManager = new JarvisClientManager();
  public state = new JarvisState(this);
  public memory = new JarvisMemory();
  public cron = new JarvisCron(this);

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

  resolveRequestConfirmation(
    id: string,
    decision: "confirm" | "reject",
  ): boolean {
    const event = this.state
      .getChatEvents()
      .find(
        (item): item is RequestConfirmationChatEvent =>
          item.role === "request-confirmation" && item.id === id,
      );
    if (!event) {
      return false;
    }
    const nextStatus = decisionToStatus(decision);
    if (event.status === nextStatus) {
      return true;
    }
    event.status = nextStatus;
    event.time = Date.now();
    this.state.notifyStateChanged();
    this.runner.runNext();
    return true;
  }

  clearChatEvents() {
    this.state.setState({
      snapshotId: nanoid(6),
      chatEvents: [],
    });
    this.state.notifyStateChanged();
  }
}

function decisionToStatus(
  decision: "confirm" | "reject",
): "confirmed" | "rejected" {
  return decision === "confirm" ? "confirmed" : "rejected";
}

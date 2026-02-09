import type { ChatEvent } from "@repo/shared/defines/chat-event";
import type { ChatState } from "@repo/shared/defines/miscs";
import { createDiff } from "@repo/shared/lib/state-sync";
import { cloneDeep } from "es-toolkit";
import { nanoid } from "nanoid";
import type Jarvis from "./jarvis";

export class JarvisState {
  private jarvis: Jarvis;
  private snapshotId: string = nanoid(6);
  private chatEvents: ChatEvent[] = [];
  private previousChatEvents: ChatEvent[] = [];

  constructor(jarvis: Jarvis) {
    this.jarvis = jarvis;
  }

  setState(chatState: ChatState) {
    this.snapshotId = chatState.snapshotId;
    this.chatEvents = chatState.chatEvents;
  }

  getState(): ChatState {
    return {
      snapshotId: this.snapshotId,
      chatEvents: this.chatEvents,
    };
  }

  getChatEvents() {
    return this.chatEvents;
  }

  notifyStateChanged() {
    const previousSnapshotId = this.snapshotId;
    const newSnapshotId = nanoid(6);
    this.snapshotId = newSnapshotId;
    const diff = createDiff(this.previousChatEvents, this.chatEvents);
    this.previousChatEvents = cloneDeep(this.chatEvents);
    this.jarvis.clientManager.pushWebSocketMessage({
      type: "chat-events-patch",
      fromId: previousSnapshotId,
      toId: newSnapshotId,
      diff,
    });
  }

  addChatEvent(chatEvent: ChatEvent) {
    this.chatEvents.push(chatEvent);
    this.notifyStateChanged();
  }
}

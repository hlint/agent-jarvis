import type { Notification } from "@repo/shared/defines/notification";
import { shortId } from "@repo/shared/lib/utils";
import fs from "fs-extra";
import type Jarvis from ".";
import { PATH_NOTIFICATIONS } from "./defines";

const MAX_CONTENT_LENGTH = 2000;

export default class JarvisNotification {
  private readonly jarvis: Jarvis;
  private notifications: Notification[] = [];

  constructor(jarvis: Jarvis) {
    this.jarvis = jarvis;
  }

  init() {
    this.load();
  }

  private load() {
    if (!fs.existsSync(PATH_NOTIFICATIONS)) {
      this.notifications = [];
      return;
    }

    const data = fs.readJSONSync(PATH_NOTIFICATIONS) as unknown;
    this.notifications = Array.isArray(data) ? (data as Notification[]) : [];
  }

  private save() {
    fs.writeJSONSync(PATH_NOTIFICATIONS, this.notifications, { spaces: 2 });
  }

  getNotificationList(): Notification[] {
    return [...this.notifications].sort((a, b) => b.createdAt - a.createdAt);
  }

  createNotification(input: {
    content: string;
    source: string;
  }):
    | { success: true; notification: Notification }
    | { success: false; error: string } {
    const content = input.content.trim();
    if (!content) {
      return { success: false, error: "Content cannot be empty" };
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      return {
        success: false,
        error: `Content exceeds ${MAX_CONTENT_LENGTH} characters`,
      };
    }

    const notification: Notification = {
      id: shortId(),
      content,
      createdAt: Date.now(),
      source: input.source.trim() || "unknown",
    };
    this.notifications.push(notification);
    this.save();
    this.notificationListUpdated();
    this.jarvis.push.sendForNotification(notification);
    return { success: true, notification };
  }

  deleteNotification(
    id: string,
  ): { success: true } | { success: false; error: string; code: "not_found" } {
    const index = this.notifications.findIndex(
      (notification) => notification.id === id,
    );
    if (index === -1) {
      return {
        success: false,
        error: "Notification not found",
        code: "not_found",
      };
    }

    this.notifications.splice(index, 1);
    this.save();
    this.notificationListUpdated();
    return { success: true };
  }

  notificationListUpdated() {
    this.jarvis.ws.pushWsMessage({
      type: "notification-list-update",
      data: this.getNotificationList(),
    });
  }
}

import type { Notification } from "@repo/shared/defines/notification";
import { shortId } from "@repo/shared/lib/utils";
import fs from "fs-extra";
import webpush from "web-push";
import {
  DIR_JARVIS,
  PATH_PUSH_SUBSCRIPTIONS,
  PATH_VAPID_KEYS,
} from "./defines";

const VAPID_SUBJECT = "mailto:jarvis@local";

type PushSubscriptionKeys = {
  p256dh: string;
  auth: string;
};

export type StoredPushSubscription = {
  id: string;
  endpoint: string;
  expirationTime: number | null;
  keys: PushSubscriptionKeys;
  createdAt: number;
};

export type PushSubscribeInput = {
  endpoint: string;
  expirationTime?: number | null;
  keys: PushSubscriptionKeys;
};

type VapidKeyPair = {
  publicKey: string;
  privateKey: string;
};

export default class JarvisPush {
  private subscriptions: StoredPushSubscription[] = [];
  private vapidKeys: VapidKeyPair | null = null;

  init() {
    fs.ensureDirSync(DIR_JARVIS);
    this.vapidKeys = this.loadOrCreateVapidKeys();
    webpush.setVapidDetails(
      VAPID_SUBJECT,
      this.vapidKeys.publicKey,
      this.vapidKeys.privateKey,
    );
    this.loadSubscriptions();
  }

  getPublicKey(): string | null {
    return this.vapidKeys?.publicKey ?? null;
  }

  subscribe(input: PushSubscribeInput): { success: true } {
    const existingIndex = this.subscriptions.findIndex(
      (item) => item.endpoint === input.endpoint,
    );
    const record: StoredPushSubscription = {
      id:
        existingIndex === -1 ? shortId() : this.subscriptions[existingIndex].id,
      endpoint: input.endpoint,
      expirationTime: input.expirationTime ?? null,
      keys: input.keys,
      createdAt:
        existingIndex === -1
          ? Date.now()
          : this.subscriptions[existingIndex].createdAt,
    };

    if (existingIndex === -1) {
      this.subscriptions.push(record);
    } else {
      this.subscriptions[existingIndex] = record;
    }

    this.saveSubscriptions();
    return { success: true };
  }

  unsubscribe(
    endpoint: string,
  ): { success: true } | { success: false; error: string; code: "not_found" } {
    const index = this.subscriptions.findIndex(
      (item) => item.endpoint === endpoint,
    );
    if (index === -1) {
      return {
        success: false,
        error: "Push subscription not found",
        code: "not_found",
      };
    }

    this.subscriptions.splice(index, 1);
    this.saveSubscriptions();
    return { success: true };
  }

  hasSubscription(endpoint: string): boolean {
    return this.subscriptions.some((item) => item.endpoint === endpoint);
  }

  sendForNotification(notification: Notification) {
    if (!this.vapidKeys || this.subscriptions.length === 0) {
      return;
    }

    const body =
      notification.content.length > 240
        ? `${notification.content.slice(0, 240)}…`
        : notification.content;

    void this.sendPush({
      title: notification.source,
      body,
      tag: notification.id,
    });
  }

  private async sendPush(payload: {
    title: string;
    body: string;
    tag: string;
  }) {
    const data = JSON.stringify(payload);
    const staleEndpoints: string[] = [];

    await Promise.allSettled(
      this.subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: subscription.keys,
            },
            data,
          );
        } catch (error) {
          const statusCode =
            error instanceof webpush.WebPushError
              ? error.statusCode
              : undefined;
          if (statusCode === 404 || statusCode === 410 || statusCode === 401) {
            staleEndpoints.push(subscription.endpoint);
          } else {
            console.warn("Web push delivery failed:", error);
          }
        }
      }),
    );

    if (staleEndpoints.length > 0) {
      this.subscriptions = this.subscriptions.filter(
        (item) => !staleEndpoints.includes(item.endpoint),
      );
      this.saveSubscriptions();
    }
  }

  private loadOrCreateVapidKeys(): VapidKeyPair {
    try {
      if (fs.existsSync(PATH_VAPID_KEYS)) {
        const stored = fs.readJSONSync(
          PATH_VAPID_KEYS,
        ) as Partial<VapidKeyPair>;
        if (stored.publicKey && stored.privateKey) {
          return {
            publicKey: stored.publicKey,
            privateKey: stored.privateKey,
          };
        }
      }
    } catch (error) {
      console.warn("Invalid vapid.json, regenerating:", error);
    }

    const generated = webpush.generateVAPIDKeys();
    fs.writeJSONSync(PATH_VAPID_KEYS, generated, { spaces: 2 });
    return generated;
  }

  private loadSubscriptions() {
    try {
      if (!fs.existsSync(PATH_PUSH_SUBSCRIPTIONS)) {
        this.subscriptions = [];
        return;
      }

      const data = fs.readJSONSync(PATH_PUSH_SUBSCRIPTIONS) as unknown;
      this.subscriptions = Array.isArray(data)
        ? (data as StoredPushSubscription[])
        : [];
    } catch (error) {
      console.warn("Invalid push-subscriptions.json, resetting:", error);
      this.subscriptions = [];
    }
  }

  private saveSubscriptions() {
    fs.writeJSONSync(PATH_PUSH_SUBSCRIPTIONS, this.subscriptions, {
      spaces: 2,
    });
  }
}

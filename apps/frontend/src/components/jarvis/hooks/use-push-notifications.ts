import { useEffect } from "react";
import { api } from "@/lib/api";
import useJarvisStore from "./use-jarvis-store";

const VAPID_STORAGE_KEY = "jarvis-push-vapid-public-key";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function isPushSupported() {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function registerPushNotifications() {
  if (!isPushSupported()) {
    return;
  }

  const registration = await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
  });
  await navigator.serviceWorker.ready;

  const { data: vapidRes } = await api.jarvis["push-vapid-public-key"].get();
  if (!vapidRes?.publicKey) {
    return;
  }

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }
  if (permission !== "granted") {
    localStorage.removeItem(VAPID_STORAGE_KEY);
    return;
  }

  const storedVapidKey = localStorage.getItem(VAPID_STORAGE_KEY);
  const vapidKeyChanged = storedVapidKey !== vapidRes.publicKey;

  let subscription = await registration.pushManager.getSubscription();
  if (subscription && vapidKeyChanged) {
    await subscription.unsubscribe();
    subscription = null;
  }

  subscription ??= await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidRes.publicKey),
  });

  const subscriptionJson = subscription.toJSON();
  if (
    !subscriptionJson.endpoint ||
    !subscriptionJson.keys?.p256dh ||
    !subscriptionJson.keys.auth
  ) {
    return;
  }

  const needsResync =
    vapidKeyChanged ||
    !(
      await api.jarvis["push-subscribe-status"].get({
        query: { endpoint: subscriptionJson.endpoint },
      })
    ).data?.registered;

  if (needsResync) {
    await api.jarvis["push-subscribe"].post({
      endpoint: subscriptionJson.endpoint,
      expirationTime: subscriptionJson.expirationTime ?? null,
      keys: {
        p256dh: subscriptionJson.keys.p256dh,
        auth: subscriptionJson.keys.auth,
      },
    });
  }

  localStorage.setItem(VAPID_STORAGE_KEY, vapidRes.publicKey);
}

export default function usePushNotifications() {
  const isConnected = useJarvisStore((state) => state.isConnected);

  useEffect(() => {
    if (!isConnected) {
      return;
    }

    void registerPushNotifications().catch((error) => {
      console.warn("Push notification setup failed:", error);
    });
  }, [isConnected]);
}

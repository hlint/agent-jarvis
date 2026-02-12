import type { WsMessageDialogHistoryPatch } from "@repo/shared/defines/jarvis";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import useJarvisStore from "./use-jarvis-store";

const useConnect = () => {
  const [wsFlag, setWsFlag] = useState(1);
  const applyDialogHistoryPatch = useJarvisStore(
    (state) => state.applyDialogHistoryPatch,
  );

  const pullFullDialogState = useJarvisStore(
    (state) => state.pullFullDialogState,
  );
  useSWR("pullFullDialogState", pullFullDialogState);

  // biome-ignore lint/correctness/useExhaustiveDependencies: wsFlag is used to reconnect the websocket
  useEffect(() => {
    const ws = api.jarvis.ws.subscribe();
    let isConnected = false;
    let timerReconnect: NodeJS.Timeout | null = null;
    const clearTimerReconnect = () => {
      if (timerReconnect) {
        clearTimeout(timerReconnect);
        timerReconnect = null;
      }
    };
    const resetTimerReconnect = () => {
      timerReconnect = setTimeout(() => {
        setWsFlag((prev) => prev + 1);
      }, 2000);
    };
    resetTimerReconnect();
    ws.on("open", () => {
      isConnected = true;
      clearTimerReconnect();
    });
    ws.on("message", ({ data }) => {
      const message = data as WsMessageDialogHistoryPatch;
      switch (message.type) {
        case "dialog-history-patch": {
          applyDialogHistoryPatch(message);
          break;
        }
      }
    });
    ws.on("close", () => {
      if (isConnected) {
        isConnected = false;
        resetTimerReconnect();
      }
    });
    return () => {
      clearTimerReconnect();
      ws.close();
    };
  }, [wsFlag]);
};

export default useConnect;

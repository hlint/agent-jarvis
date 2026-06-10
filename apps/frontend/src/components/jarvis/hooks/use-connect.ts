import type { WsMessage } from "@repo/shared/defines/ws";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import useJarvisStore from "./use-jarvis-store";

const useConnect = () => {
  const [wsFlag, setWsFlag] = useState(1);
  const handleWsMessage = useJarvisStore((state) => state.handleWsMessage);
  const setIsConnected = useJarvisStore((state) => state.setIsConnected);
  const pullState = useJarvisStore((state) => state.pullState);
  useSWR("pullState", pullState);

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
      setIsConnected(true);
      clearTimerReconnect();
    });
    ws.on("message", ({ data }) => {
      const message = data as WsMessage;
      handleWsMessage(message);
    });
    ws.on("close", () => {
      if (isConnected) {
        isConnected = false;
        setIsConnected(false);
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

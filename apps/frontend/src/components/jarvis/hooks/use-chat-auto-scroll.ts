import {
  type RefObject,
  type UIEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import useJarvisStore from "./use-jarvis-store";

const BOTTOM_THRESHOLD_PX = 48;
const SCROLL_MARGIN_PX = 16;
const SCROLL_DELAY_MS = 100;
const SESSION_SCROLL_DELAY_MS = 150;

function isNearBottom(element: HTMLElement) {
  return (
    element.scrollHeight - element.scrollTop - element.clientHeight <=
    BOTTOM_THRESHOLD_PX
  );
}

export default function useChatAutoScroll(
  scrollRef: RefObject<HTMLElement | null>,
) {
  const programmaticScrollRef = useRef(false);
  const pendingScrollNonceRef = useRef(0);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const currentSession = useJarvisStore((state) => state.currentSession);
  const sendScrollNonce = useJarvisStore((state) => state.sendScrollNonce);
  const prevSessionIdRef = useRef<string | null | undefined>(undefined);

  const readIsNearBottom = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return true;
    return isNearBottom(element);
  }, [scrollRef]);

  const scrollRoundToTop = useCallback(
    (roundId: string, behavior: ScrollBehavior = "smooth") => {
      const container = scrollRef.current;
      const roundEl = document.getElementById(`round-${roundId}`);
      if (!container || !roundEl) return;

      programmaticScrollRef.current = true;
      const top =
        roundEl.getBoundingClientRect().top -
        container.getBoundingClientRect().top +
        container.scrollTop;

      container.scrollTo({
        top: Math.max(0, top - SCROLL_MARGIN_PX),
        behavior,
      });

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          programmaticScrollRef.current = false;
          setShowScrollButton(!readIsNearBottom());
        });
      });
    },
    [readIsNearBottom, scrollRef],
  );

  const scrollToBottom = useCallback(
    (options?: { behavior?: ScrollBehavior }) => {
      const element = scrollRef.current;
      if (!element) return;

      programmaticScrollRef.current = true;
      element.scrollTo({
        top: element.scrollHeight,
        behavior: options?.behavior ?? "smooth",
      });

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          programmaticScrollRef.current = false;
          setShowScrollButton(false);
        });
      });
    },
    [scrollRef],
  );

  const onScroll: UIEventHandler<HTMLElement> = useCallback(() => {
    if (programmaticScrollRef.current) return;
    setShowScrollButton(!readIsNearBottom());
  }, [readIsNearBottom]);

  const jumpToLatest = useCallback(() => {
    scrollToBottom({ behavior: "smooth" });
  }, [scrollToBottom]);

  useEffect(() => {
    if (sendScrollNonce === 0) return;
    pendingScrollNonceRef.current = sendScrollNonce;
  }, [sendScrollNonce]);

  useEffect(() => {
    const sessionId = currentSession?.id ?? null;
    if (prevSessionIdRef.current === sessionId) return;
    prevSessionIdRef.current = sessionId;

    if (!sessionId || pendingScrollNonceRef.current !== 0) return;

    const timer = window.setTimeout(() => {
      if (pendingScrollNonceRef.current !== 0) return;
      scrollToBottom({ behavior: "auto" });
    }, SESSION_SCROLL_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [currentSession?.id, scrollToBottom]);

  useEffect(() => {
    if (pendingScrollNonceRef.current === 0) return;

    const lastRound = currentSession?.rounds[currentSession.rounds.length - 1];
    if (!lastRound) return;

    const timer = window.setTimeout(() => {
      scrollRoundToTop(lastRound.id);
      pendingScrollNonceRef.current = 0;
    }, SCROLL_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [currentSession?.rounds, scrollRoundToTop]);

  return {
    showScrollButton,
    onScroll,
    jumpToLatest,
  };
}

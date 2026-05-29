import { type RefObject, useEffect } from "react";
import useJarvisStore from "./use-jarvis-store";

const SCROLL_SPY_OFFSET_PX = 5 * 16;

export function useEntryScrollSpy(
  scrollContainerRef: RefObject<HTMLDivElement | null>,
  entryIdsStr: string,
) {
  const setActiveEntryId = useJarvisStore((state) => state.setActiveEntryId);
  useEffect(() => {
    const container = scrollContainerRef.current;
    const entryIds = entryIdsStr.split(",");
    if (!container || entryIds.length === 0) {
      setActiveEntryId(null);
      return;
    }

    let rafId = 0;

    const updateActiveEntry = () => {
      rafId = 0;
      let bias = Infinity;
      const activationLine =
        container.getBoundingClientRect().top + SCROLL_SPY_OFFSET_PX;
      let activeId: string | null = entryIds[0] ?? null;

      for (const id of entryIds) {
        const element = document.getElementById(`entry-message-${id}`);
        if (!element) continue;
        const newBias = Math.abs(
          element.getBoundingClientRect().top - activationLine,
        );
        if (newBias < bias) {
          bias = newBias;
          activeId = id;
        }
      }

      setActiveEntryId(activeId);
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(updateActiveEntry);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    updateActiveEntry();

    return () => {
      container.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [scrollContainerRef, entryIdsStr, setActiveEntryId]);
}

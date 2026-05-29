import { useEffect, useMemo, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import JarvisEntryNav from "./entry-nav";
import JarvisInput from "./input";
import JarvisMessages from "./messages";
import JarvisTop from "./top";
import useConnect from "./use-connect";
import { useEntryScrollSpy } from "./use-entry-scroll-spy";
import useJarvisStore from "./use-jarvis-store";
import JarvisWelcome from "./welcome";

export default function Jarvis() {
  useConnect();
  const isDesktop = !useIsMobile(1024 + 280);
  const visibleDialogHistory = useJarvisStore(
    (state) => state.visibleDialogHistory,
  );
  const isEmpty = visibleDialogHistory.length === 0;
  const entryIdsStr = useMemo(
    () => visibleDialogHistory.map((entry) => entry.id).join(","),
    [visibleDialogHistory],
  );
  const setHandleScrollToBottom = useJarvisStore(
    (state) => state.setHandleScrollToBottom,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  useEntryScrollSpy(containerRef, entryIdsStr);
  useEffect(() => {
    const scrollToBottom = (force: boolean = false) => {
      if (containerRef.current) {
        const isAtBottom =
          containerRef.current.scrollTop + containerRef.current.clientHeight >=
          containerRef.current.scrollHeight - 100;
        if (force || isAtBottom) {
          setTimeout(() => {
            containerRef.current?.scrollTo({
              top: containerRef.current?.scrollHeight,
              behavior: "smooth",
            });
          }, 200);
        }
      }
    };
    setHandleScrollToBottom(scrollToBottom);
    return () => {
      setHandleScrollToBottom(() => {});
    };
  }, [setHandleScrollToBottom]);
  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-auto w-full overflow-x-hidden flex justify-center gap-3 items-start"
    >
      {isDesktop && !isEmpty && <JarvisEntryNav />}
      <div
        className={cn(
          "w-full min-w-0 max-w-3xl flex-1 min-h-screen relative flex flex-col gap-6",
          isEmpty && "justify-center",
        )}
      >
        {!isEmpty && <JarvisTop />}
        <div className="flex-1 lg:flex-none lg:min-h-[370px]">
          {isEmpty ? <JarvisWelcome /> : <JarvisMessages />}
        </div>
        <JarvisInput />
      </div>
    </div>
  );
}

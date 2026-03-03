import { useEffect, useRef } from "react";
import JarvisInput from "./input";
import JarvisMessages from "./messages";
import JarvisTop from "./top";
import useConnect from "./use-connect";
import useJarvisStore from "./use-jarvis-store";
import JarvisWelcome from "./welcome";

export default function Jarvis() {
  useConnect();
  const dialogHistory = useJarvisStore((state) => state.dialogHistory);
  const isEmpty = dialogHistory.length === 0;
  const setHandleScrollToBottom = useJarvisStore(
    (state) => state.setHandleScrollToBottom,
  );
  const containerRef = useRef<HTMLDivElement>(null);
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
    <div ref={containerRef} className="h-screen overflow-auto">
      <div className="max-w-3xl min-h-screen mx-auto relative flex flex-col gap-6">
        <JarvisTop />
        <div className="flex-1 lg:flex-none lg:min-h-[350px]">
          {isEmpty ? <JarvisWelcome /> : <JarvisMessages />}
        </div>
        <JarvisInput />
      </div>
    </div>
  );
}

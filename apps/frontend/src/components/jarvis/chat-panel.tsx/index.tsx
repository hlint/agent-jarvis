import { useRef } from "react";
import { cn } from "@/lib/utils";
import useChatAutoScroll from "../hooks/use-chat-auto-scroll";
import useJarvisStore from "../hooks/use-jarvis-store";
import { CHAT_CONTENT_CLASS } from "../layout/constants";
import {
  JarvisChatScrollFadeBottom,
  JarvisChatScrollFadeTop,
} from "./chat-scroll-fade";
import JarvisInput from "./input";
import JarvisMessages from "./messages";
import JarvisChatMobileToolbar from "./mobile-toolbar";
import JarvisScrollToBottomButton from "./scroll-to-bottom-button";
import JarvisWelcome from "./welcome";

export default function JarvisChatPanel({ className }: { className?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentSession = useJarvisStore((state) => state.currentSession);
  const isEmpty = !currentSession?.rounds.length;
  const { showScrollButton, onScroll, jumpToLatest } =
    useChatAutoScroll(scrollRef);

  return (
    <div
      className={cn(
        "flex h-full min-h-0 min-w-0 flex-col bg-background-secondary",
        className,
      )}
    >
      <JarvisChatMobileToolbar />
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto"
        >
          <div className="flex min-h-full flex-col">
            {!isEmpty && <JarvisChatScrollFadeTop />}
            <div
              className={cn(
                CHAT_CONTENT_CLASS,
                "flex min-h-[60vh] flex-col py-4",
                isEmpty && "items-center justify-center",
              )}
            >
              {isEmpty ? <JarvisWelcome /> : <JarvisMessages />}
            </div>
            <div className="sticky bottom-0 z-20">
              {!isEmpty && <JarvisChatScrollFadeBottom />}
              <div
                className={cn(
                  CHAT_CONTENT_CLASS,
                  "bg-background-secondary py-3",
                )}
              >
                <JarvisInput />
              </div>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 z-30 flex items-end justify-end p-4 pb-28">
          <JarvisScrollToBottomButton
            visible={showScrollButton && !isEmpty}
            onClick={jumpToLatest}
            className="pointer-events-auto static"
          />
        </div>
      </div>
    </div>
  );
}

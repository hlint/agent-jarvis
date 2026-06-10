import { cn } from "@/lib/utils";
import useJarvisStore from "../hooks/use-jarvis-store";
import { WHITEBOARD_WIDTH_CLASS } from "../layout/constants";
import JarvisWhiteboard from "./index";

export default function JarvisWhiteboardPanel() {
  const isMobileMode = useJarvisStore((state) => state.isMobileMode);
  const mobileWhiteboardOpen = useJarvisStore(
    (state) => state.mobileWhiteboardOpen,
  );
  const desktopWhiteboardOpen = useJarvisStore(
    (state) => state.desktopWhiteboardOpen,
  );

  if (isMobileMode) {
    return (
      <aside
        className={cn(
          "absolute inset-y-0 right-0 z-50 flex h-full min-h-0 flex-col bg-background",
          WHITEBOARD_WIDTH_CLASS,
          "border-l border-border/60 shadow-xl transition-transform duration-300 ease-out",
          mobileWhiteboardOpen
            ? "translate-x-0"
            : "pointer-events-none translate-x-full",
        )}
        aria-hidden={!mobileWhiteboardOpen}
      >
        <JarvisWhiteboard />
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "relative shrink-0 transition-[width] duration-300 ease-out",
        desktopWhiteboardOpen ? WHITEBOARD_WIDTH_CLASS : "w-0",
      )}
      aria-hidden={!desktopWhiteboardOpen}
    >
      <div
        className={cn(
          "absolute inset-y-0 right-0 overflow-hidden border-l border-border/60 bg-background transition-[width] duration-300 ease-out",
          desktopWhiteboardOpen ? WHITEBOARD_WIDTH_CLASS : "w-0 border-l-0",
        )}
      >
        <div
          className={cn(
            "h-full transition-transform duration-300 ease-out",
            WHITEBOARD_WIDTH_CLASS,
            !desktopWhiteboardOpen && "translate-x-full",
          )}
        >
          <JarvisWhiteboard />
        </div>
      </div>
    </aside>
  );
}

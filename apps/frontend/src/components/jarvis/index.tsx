import { cn } from "@/lib/utils";
import JarvisChatPanel from "./chat-panel.tsx";
import useConnect from "./hooks/use-connect";
import useJarvisStore from "./hooks/use-jarvis-store.ts";
import usePushNotifications from "./hooks/use-push-notifications";
import { SIDEBAR_WIDTH_CLASS } from "./layout/constants";
import { useJarvisLayout } from "./layout/use-jarvis-layout";
import JarvisSidebar from "./sidebar/index.tsx";
import JarvisWhiteboardExpandButton from "./whiteboard/expand-button";
import JarvisWhiteboardPanel from "./whiteboard/panel";

export default function Jarvis() {
  useConnect();
  usePushNotifications();
  useJarvisLayout();

  const isMobileMode = useJarvisStore((state) => state.isMobileMode);
  const mobileSidebarOpen = useJarvisStore((state) => state.mobileSidebarOpen);
  const setMobileSidebarOpen = useJarvisStore(
    (state) => state.setMobileSidebarOpen,
  );
  const mobileWhiteboardOpen = useJarvisStore(
    (state) => state.mobileWhiteboardOpen,
  );
  const setMobileWhiteboardOpen = useJarvisStore(
    (state) => state.setMobileWhiteboardOpen,
  );

  return (
    <div className="relative flex h-dvh overflow-hidden">
      <aside
        className={cn(
          "flex h-full min-h-0 flex-col overflow-hidden border-r border-border/60 bg-background",
          SIDEBAR_WIDTH_CLASS,
          isMobileMode
            ? cn(
                "absolute inset-y-0 left-0 z-50 shadow-xl transition-transform duration-300 ease-out",
                mobileSidebarOpen
                  ? "translate-x-0"
                  : "pointer-events-none -translate-x-full",
              )
            : "shrink-0 ",
        )}
        aria-hidden={isMobileMode && !mobileSidebarOpen}
      >
        <JarvisSidebar />
      </aside>
      <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <JarvisChatPanel
          className={cn(isMobileMode ? "absolute inset-0" : "min-w-0 flex-1")}
        />
        <JarvisWhiteboardExpandButton />
        {isMobileMode && (
          <div
            className={cn(
              "absolute inset-0 z-40",
              !mobileSidebarOpen && "pointer-events-none",
            )}
            aria-hidden={!mobileSidebarOpen}
          >
            <button
              type="button"
              aria-label="Close menu"
              tabIndex={mobileSidebarOpen ? 0 : -1}
              className={cn(
                "absolute inset-0 bg-foreground/40 transition-opacity duration-300",
                mobileSidebarOpen ? "opacity-100" : "opacity-0",
              )}
              onClick={() => setMobileSidebarOpen(false)}
            />
          </div>
        )}
        {isMobileMode && (
          <div
            className={cn(
              "absolute inset-0 z-40",
              !mobileWhiteboardOpen && "pointer-events-none",
            )}
            aria-hidden={!mobileWhiteboardOpen}
          >
            <button
              type="button"
              aria-label="Close whiteboard"
              tabIndex={mobileWhiteboardOpen ? 0 : -1}
              className={cn(
                "absolute inset-0 bg-foreground/40 transition-opacity duration-300",
                mobileWhiteboardOpen ? "opacity-100" : "opacity-0",
              )}
              onClick={() => setMobileWhiteboardOpen(false)}
            />
          </div>
        )}
        <JarvisWhiteboardPanel />
      </div>
    </div>
  );
}

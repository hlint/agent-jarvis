import { normalizeRecentWhiteboardPaths } from "@repo/shared/lib/session";
import { useEffect, useRef } from "react";
import useJarvisStore from "../hooks/use-jarvis-store";
import JarvisWhiteboardAddressBar from "./address-bar";
import { WHITEBOARD_NAVIGATE_MESSAGE_TYPE } from "./constants";
import { buildJarvisFileUrl } from "./file-url";

export default function JarvisWhiteboard() {
  const isMobileMode = useJarvisStore((state) => state.isMobileMode);
  const desktopWhiteboardOpen = useJarvisStore(
    (state) => state.desktopWhiteboardOpen,
  );
  const toggleDesktopWhiteboard = useJarvisStore(
    (state) => state.toggleDesktopWhiteboard,
  );
  const currentSession = useJarvisStore((state) => state.currentSession);
  const localWhiteboardPath = useJarvisStore(
    (state) => state.localWhiteboardPath,
  );
  const localWhiteboardRevision = useJarvisStore(
    (state) => state.localWhiteboardRevision,
  );
  const navigateWhiteboard = useJarvisStore(
    (state) => state.navigateWhiteboard,
  );
  const openWhiteboardPanel = useJarvisStore(
    (state) => state.openWhiteboardPanel,
  );
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const path = currentSession?.whiteboardPath ?? localWhiteboardPath;
  const revision =
    currentSession?.whiteboardRevision ?? localWhiteboardRevision;
  const recentPaths = normalizeRecentWhiteboardPaths(
    currentSession?.recentWhiteboardPaths,
  );

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const iframe = iframeRef.current;
      if (!iframe?.contentWindow || event.source !== iframe.contentWindow) {
        return;
      }
      if (
        !event.data ||
        typeof event.data !== "object" ||
        event.data.type !== WHITEBOARD_NAVIGATE_MESSAGE_TYPE
      ) {
        return;
      }
      const nextPath =
        typeof event.data.path === "string" ? event.data.path.trim() : "";
      if (!nextPath) return;

      void navigateWhiteboard(nextPath);
      openWhiteboardPanel();
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [navigateWhiteboard, openWhiteboardPanel]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="shrink-0 space-y-2 px-3 py-2">
        <JarvisWhiteboardAddressBar
          path={path}
          recentPaths={recentPaths}
          onNavigate={navigateWhiteboard}
          onRefresh={() => navigateWhiteboard(path)}
          onHidePanel={
            !isMobileMode && desktopWhiteboardOpen
              ? toggleDesktopWhiteboard
              : undefined
          }
        />
      </div>
      <iframe
        ref={iframeRef}
        key={`${path}:${revision}`}
        name="jarvis-whiteboard"
        title="Whiteboard content"
        src={buildJarvisFileUrl(path, revision)}
        className="min-h-0 w-full flex-1 border-0 bg-background"
      />
    </div>
  );
}

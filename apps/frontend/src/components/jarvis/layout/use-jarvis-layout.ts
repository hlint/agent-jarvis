import { useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import useJarvisStore from "../hooks/use-jarvis-store";
import { DESKTOP_NAV_BREAKPOINT } from "./constants";

export function useJarvisLayout() {
  const isBelowDesktopNav = useIsMobile(DESKTOP_NAV_BREAKPOINT);
  const setIsMobileMode = useJarvisStore((state) => state.setIsMobileMode);
  const setMobileSidebarOpen = useJarvisStore(
    (state) => state.setMobileSidebarOpen,
  );
  const setMobileWhiteboardOpen = useJarvisStore(
    (state) => state.setMobileWhiteboardOpen,
  );

  useEffect(() => {
    setIsMobileMode(isBelowDesktopNav);
    if (isBelowDesktopNav) {
      setMobileSidebarOpen(false);
      setMobileWhiteboardOpen(false);
    }
  }, [
    isBelowDesktopNav,
    setIsMobileMode,
    setMobileSidebarOpen,
    setMobileWhiteboardOpen,
  ]);
}

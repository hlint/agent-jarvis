import { ListTreeIcon, PanelsTopLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useJarvisStore from "../hooks/use-jarvis-store";

export default function JarvisChatMobileToolbar({
  className,
}: {
  className?: string;
}) {
  const isMobileMode = useJarvisStore((state) => state.isMobileMode);
  const mobileSidebarOpen = useJarvisStore((state) => state.mobileSidebarOpen);
  const mobileWhiteboardOpen = useJarvisStore(
    (state) => state.mobileWhiteboardOpen,
  );
  const toggleMobileSidebar = useJarvisStore(
    (state) => state.toggleMobileSidebar,
  );
  const toggleMobileWhiteboard = useJarvisStore(
    (state) => state.toggleMobileWhiteboard,
  );

  if (!isMobileMode) return null;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-between gap-2 border-b border-border/60 px-3 py-2",
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Open menu"
        aria-expanded={mobileSidebarOpen}
        onClick={() => toggleMobileSidebar()}
      >
        <ListTreeIcon className="size-5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Open whiteboard"
        aria-expanded={mobileWhiteboardOpen}
        onClick={() => toggleMobileWhiteboard()}
      >
        <PanelsTopLeftIcon className="size-5" />
      </Button>
    </div>
  );
}

import { ChevronLeftIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import useJarvisStore from "../hooks/use-jarvis-store";

export default function JarvisWhiteboardExpandButton() {
  const isMobileMode = useJarvisStore((state) => state.isMobileMode);
  const desktopWhiteboardOpen = useJarvisStore(
    (state) => state.desktopWhiteboardOpen,
  );
  const toggleDesktopWhiteboard = useJarvisStore(
    (state) => state.toggleDesktopWhiteboard,
  );

  if (isMobileMode || desktopWhiteboardOpen) return null;

  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        aria-label="Show whiteboard"
        aria-expanded={false}
        onClick={toggleDesktopWhiteboard}
        className={cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "absolute top-2 right-3 z-30 shadow-sm",
        )}
      >
        <ChevronLeftIcon />
      </TooltipTrigger>
      <TooltipContent side="left">Show whiteboard</TooltipContent>
    </Tooltip>
  );
}

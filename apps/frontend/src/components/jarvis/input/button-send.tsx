import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import useJarvisStore from "../use-jarvis-store";

export default function ButtonSend({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  const status = useJarvisStore((state) => state.status);
  if (status === "running")
    return (
      <Button
        type="button"
        variant="secondary"
        className={className}
        onClick={() => api.jarvis["abort-execution"].post()}
      >
        <Loader2Icon className="size-4 animate-spin" />
        <span>Abort</span>
      </Button>
    );
  if (status === "stopping")
    return (
      <Button
        type="button"
        variant="destructive"
        disabled
        className={className}
        onClick={onClick}
      >
        <Loader2Icon className="size-4 animate-spin" />
        <span>Aborting...</span>
      </Button>
    );
  return (
    <Button
      type="button"
      variant="default"
      className={cn("group bg-primary/20 hover:bg-primary/50", className)}
      onClick={onClick}
    >
      <img
        src="/favicon.png"
        alt="Jarvis"
        className="size-4 transition-all duration-200 group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]"
      />

      <span className="bg-linear-to-r from-red-200 via-blue-200 to-green-200 bg-clip-text text-transparent">
        Send
      </span>
    </Button>
  );
}

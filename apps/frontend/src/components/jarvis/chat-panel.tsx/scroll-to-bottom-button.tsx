import { ArrowDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function JarvisScrollToBottomButton({
  visible,
  onClick,
  className,
}: {
  visible: boolean;
  onClick: () => void;
  className?: string;
}) {
  if (!visible) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Go to bottom"
      onClick={onClick}
      className={cn(
        "size-8 rounded-full bg-background/95 shadow-md backdrop-blur-sm",
        className,
      )}
    >
      <ArrowDownIcon className="size-4" />
    </Button>
  );
}

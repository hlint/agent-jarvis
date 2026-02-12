import { Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import JarvisMarkdown from "./markdown";

export default function JarvisMessage({
  text,
  type,
  isAnimating,
}: {
  text: string;
  type: "agent-reply" | "user";
  isAnimating?: boolean;
}) {
  if (type === "user") {
    return (
      <div className="flex flex-row gap-3 justify-end">
        <p className="bg-muted p-4 rounded-lg whitespace-pre-wrap max-w-md overflow-auto">
          {text}
        </p>
      </div>
    );
  }
  return (
    <div className={cn("flex flex-row gap-0.5 justify-start")}>
      <span className={cn("text-lg relative bottom-0.5 block")}>✨</span>
      {text ? (
        <JarvisMarkdown
          className="overflow-auto mr-2"
          text={text}
          isAnimating={isAnimating}
        />
      ) : (
        <Loader2Icon className="size-6 text-primary animate-spin" />
      )}
    </div>
  );
}

import "katex/dist/katex.min.css";
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import { Loader2Icon } from "lucide-react";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";

export default function JarvisMessage({
  text,
  type,
  isAnimating,
}: {
  text: string;
  type: "assistant" | "user";
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
    <div className={cn("flex flex-row gap-3 justify-start")}>
      <span className={cn("text-lg relative bottom-0.5 block")}>✨</span>
      {text ? (
        <Streamdown
          className=" overflow-auto mr-2"
          plugins={{ code, mermaid, math, cjk }}
          isAnimating={isAnimating}
        >
          {text}
        </Streamdown>
      ) : (
        <Loader2Icon className="size-6 text-primary animate-spin" />
      )}
    </div>
  );
}

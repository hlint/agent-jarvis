import "katex/dist/katex.min.css";
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";

export default function JarvisMarkdown({
  text = "",
  isAnimating,
  className,
}: {
  text?: string;
  isAnimating?: boolean;
  className?: string;
}) {
  const content = text;
  return (
    <Streamdown
      className={cn("overflow-auto", className)}
      plugins={{ code, mermaid, math, cjk }}
      isAnimating={isAnimating}
    >
      {content}
    </Streamdown>
  );
}

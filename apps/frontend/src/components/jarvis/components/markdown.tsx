import "katex/dist/katex.min.css";
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { createMathPlugin } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";

const math = createMathPlugin({
  singleDollarTextMath: true, // Enable $...$ syntax (default: false)
});

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
      className={cn(
        "overflow-auto text-sm/relaxed [&_code]:whitespace-normal",
        className,
      )}
      plugins={{ code, mermaid, math, cjk }}
      isAnimating={isAnimating}
    >
      {content}
    </Streamdown>
  );
}

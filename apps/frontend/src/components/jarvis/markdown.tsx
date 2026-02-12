import "katex/dist/katex.min.css";
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import { Streamdown } from "streamdown";

export default function JarvisMarkdown({
  text,
  isAnimating,
  className,
}: {
  text: string;
  isAnimating?: boolean;
  className?: string;
}) {
  return (
    <Streamdown
      className={className}
      plugins={{ code, mermaid, math, cjk }}
      isAnimating={isAnimating}
    >
      {text}
    </Streamdown>
  );
}

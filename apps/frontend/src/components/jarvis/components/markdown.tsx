import "katex/dist/katex.min.css";
import "streamdown/styles.css";
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { createMathPlugin } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import type { ComponentProps } from "react";
import { type PluginConfig, Streamdown } from "streamdown";
import { cn } from "@/lib/utils";

const math = createMathPlugin({
  singleDollarTextMath: true, // Enable $...$ syntax (default: false)
});

const plugins = {
  code,
  mermaid,
  math,
  cjk,
} as PluginConfig;

const fadeInAnimation = {
  animation: "fadeIn",
  duration: 180,
  easing: "ease-out",
  sep: "word",
  stagger: 24,
} as const;

type StreamdownComponentProps = ComponentProps<typeof Streamdown> & {
  animated?: boolean | typeof fadeInAnimation;
  isAnimating?: boolean;
  caret?: "block";
};

const markdownClassName =
  "min-w-0 max-w-full text-sm/relaxed **:data-[streamdown=code-block]:max-w-full **:data-[streamdown=code-block]:bg-muted/20 [&_[data-streamdown=code-block]_pre]:max-w-full [&_[data-streamdown=code-block]_pre]:whitespace-pre-wrap [&_[data-streamdown=code-block]_pre]:break-all [&_[data-streamdown=code-block]_pre_code]:break-all [&_table]:rounded-xl [&_table]:overflow-hidden";

export default function JarvisMarkdown({
  text = "",
  isAnimating,
  className,
}: {
  text?: string;
  isAnimating?: boolean;
  className?: string;
}) {
  const props: StreamdownComponentProps = {
    mode: "streaming",
    className: cn(markdownClassName, className),
    plugins,
    children: text,
    ...(isAnimating
      ? { animated: fadeInAnimation, caret: "block", isAnimating: true }
      : { isAnimating: false }),
  };

  return <Streamdown {...props} />;
}

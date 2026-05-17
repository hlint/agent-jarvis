"use client";

import { CheckIcon, CopyIcon, DownloadIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { highlightHtml } from "./highlight-html";

const SOURCE_SCROLL_CLASS =
  "h-full overflow-y-auto overflow-x-hidden p-4 font-mono text-xs whitespace-pre-wrap wrap-break-word";

const SHIKI_WRAPPER_CLASS = cn(
  "html-source-shiki",
  SOURCE_SCROLL_CLASS,
  "[&_pre]:m-0 [&_pre]:!bg-transparent [&_pre]:p-0",
  "[&_pre]:!whitespace-pre-wrap [&_pre]:wrap-break-word [&_pre]:overflow-x-hidden",
  "[&_code]:bg-transparent [&_code]:font-mono [&_code]:text-xs",
  "[&_code]:!whitespace-pre-wrap [&_code]:wrap-break-word",
);

export default function JarvisHtmlSource({
  source,
  active,
}: {
  source: string;
  active: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!active || !source) return;

    let cancelled = false;

    setHighlighted(null);
    setLoading(true);
    highlightHtml(source)
      .then((html) => {
        if (!cancelled) {
          setHighlighted(html);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHighlighted(null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [active, source]);

  const handleDownload = () => {
    const url = URL.createObjectURL(
      new Blob([source], { type: "text/html;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "file.html";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable; keep copy icon state unchanged.
    }
  };

  return (
    <>
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="backdrop-blur-sm"
          title="Download File"
          aria-label="Download File"
          onClick={handleDownload}
        >
          <DownloadIcon className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="backdrop-blur-sm"
          title="Copy Source"
          aria-label="Copy Source"
          onClick={handleCopy}
        >
          {copied ? (
            <CheckIcon className="size-3.5" />
          ) : (
            <CopyIcon className="size-3.5" />
          )}
        </Button>
      </div>
      {loading && !highlighted ? (
        <pre
          className={cn(
            "m-0 bg-muted/20 text-muted-foreground",
            SOURCE_SCROLL_CLASS,
          )}
        >
          {source}
        </pre>
      ) : highlighted ? (
        <div
          className={SHIKI_WRAPPER_CLASS}
          // Shiki output is trusted static markup from our highlighter, not user HTML.
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      ) : (
        <pre className={cn("m-0 bg-muted/20", SOURCE_SCROLL_CLASS)}>
          {source}
        </pre>
      )}
    </>
  );
}

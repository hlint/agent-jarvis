"use client";

import type { HtmlViewEntry } from "@repo/shared/defines/jarvis";
import { getHtmlViewEntryDisplayText } from "@repo/shared/lib/utils";
import { CodeXml, EyeIcon, PanelsTopLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import JarvisHtmlSource from "../components/html-source";

const IFRAME_SANDBOX =
  "allow-scripts allow-same-origin allow-forms allow-popups allow-modals";

/** Bounds for the html-view card; preview iframe sets height, source overlays the same box. */
const HTML_VIEW_SHELL_CLASS = "overflow-auto";
/** iframe stays in flow (sizes the box); source overlays with absolute inset-0. */
const HTML_VIEW_PANELS_CLASS = "relative w-full";

export default function JarvisHtmlViewEntry(entry: HtmlViewEntry) {
  const title = getHtmlViewEntryDisplayText(entry);
  const [tab, setTab] = useState("preview");
  const source = entry.content ?? "";
  const previewHtml = useMemo(() => htmlInjection(source), [source]);

  return (
    <HtmlViewShell title={title}>
      <Tabs value={tab} onValueChange={setTab} className="flex flex-col gap-0">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b bg-muted/30 px-2 py-1.5">
          <TabsList variant="line" className="h-auto bg-transparent p-0">
            <TabsTrigger value="preview" className="gap-1.5 px-2 py-1">
              <EyeIcon className="size-3.5" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="source" className="gap-1.5 px-2 py-1">
              <CodeXml className="size-3.5" />
              Source
            </TabsTrigger>
          </TabsList>
        </div>
        <div className={HTML_VIEW_PANELS_CLASS}>
          <div
            className={cn(
              "w-full",
              tab !== "preview" && "pointer-events-none invisible",
            )}
            aria-hidden={tab !== "preview"}
          >
            <iframe
              title={title}
              srcDoc={previewHtml}
              sandbox={IFRAME_SANDBOX}
              className="block w-full min-h-[280px] max-h-400vh border-0 bg-transparent"
            />
          </div>
          <div
            className={cn(
              "absolute inset-0 z-10 flex min-h-0 flex-col overflow-hidden",
              tab !== "source" && "pointer-events-none invisible",
            )}
            aria-hidden={tab !== "source"}
          >
            <JarvisHtmlSource
              source={source}
              active={tab === "source"}
              title={title}
            />
          </div>
        </div>
      </Tabs>
    </HtmlViewShell>
  );
}

function HtmlViewShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex w-full max-w-full flex-col items-start gap-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <PanelsTopLeft className="size-3.5 shrink-0" />
        <span className="truncate font-medium">{title}</span>
      </div>
      <div
        className={cn(
          "flex w-full flex-col rounded-xl border bg-muted/20",
          HTML_VIEW_SHELL_CLASS,
        )}
      >
        {children}
      </div>
    </div>
  );
}

const HTML_VIEW_INJECTION = `<style>
      html {
        color-scheme: dark;
				font-family: ui-sans-serif, system-ui, "PingFang SC", "Hiragino Sans GB",
          "Microsoft YaHei", "Noto Sans SC", sans-serif;
        // height: auto !important;
        // min-height: 0 !important;
        // overflow: hidden;
      }
      body {
        margin: 0;
        // height: auto !important;
        // min-height: 0 !important;
        // overflow: hidden;
      }
      * {
        scrollbar-width: thin;
        transition: scrollbar-color 0.1s ease-in-out;
        scrollbar-color: transparent transparent;
      }
			*:hover {
        scrollbar-color: oklch(1 0 0 / 20%) transparent;
      }
      ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background: oklch(0.5 0 0 / 20%);
        border-radius: 999px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: oklch(1 0 0 / 35%);
      }
      [x-cloak] {
        display: none !important;
      }
    </style>
    <script>
      (function () {
        var scheduled = false;
        function measureMainHeight() {
          var main = document.querySelector("main");
          if (!main) return 0;
          var style = window.getComputedStyle(main);
          var marginTop = parseFloat(style.marginTop) || 0;
          var marginBottom = parseFloat(style.marginBottom) || 0;
          return Math.ceil(main.scrollHeight + marginTop + marginBottom);
        }
        function reportHeight() {
          var height = measureMainHeight();
          if (height <= 0) return;
          window.parent.postMessage(
            { type: "RESIZE_HTML_VIEW", height: height },
            "*",
          );
        }
        function scheduleReportHeight() {
          if (scheduled) return;
          scheduled = true;
          requestAnimationFrame(function () {
            scheduled = false;
            reportHeight();
          });
        }
        function setupAutoResize() {
          var main = document.querySelector("main");
          if (!main) return;
          reportHeight();
          new MutationObserver(scheduleReportHeight).observe(main, {
            attributes: true,
            childList: true,
            subtree: true,
          });
          if (typeof ResizeObserver !== "undefined") {
            new ResizeObserver(scheduleReportHeight).observe(main);
          }
          window.addEventListener("load", scheduleReportHeight);
        }
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", setupAutoResize);
        } else {
          setupAutoResize();
        }
      })();
    </script>`;

function htmlInjection(rawHtml: string) {
  if (rawHtml.includes("</head>")) {
    return rawHtml.replace("</head>", `${HTML_VIEW_INJECTION}</head>`);
  }
  if (/<body[\s>]/i.test(rawHtml)) {
    return rawHtml.replace(/<body([\s>])/i, `${HTML_VIEW_INJECTION}<body$1`);
  }
  return `${HTML_VIEW_INJECTION}${rawHtml}`;
}

"use client";

import type { DialogHistory } from "@repo/shared/agent/defines/history";
import type { HtmlViewEntry } from "@repo/shared/defines/jarvis";
import { getHtmlViewEntryDisplayText } from "@repo/shared/lib/utils";
import { CodeXml, EyeIcon, PanelsTopLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import JarvisHtmlSource from "../components/html-source";
import useJarvisStore from "../use-jarvis-store";

const IFRAME_SANDBOX =
  "allow-scripts allow-same-origin allow-forms allow-popups allow-modals";

/** Shared viewport height for preview, source, and placeholder states. */
const HTML_VIEW_HEIGHT =
  "h-[min(calc(100vh-250px),800px)] min-h-[320px] max-h-[800px]";

function findHtmlByReferenceEntryId(
  dialogHistory: DialogHistory,
  referenceEntryId?: string,
): { html: string | null; toolStatus?: "pending" | "completed" | "failed" } {
  if (!referenceEntryId) {
    return { html: null };
  }
  const refEntry = dialogHistory.find((e) => e.id === referenceEntryId);
  if (!refEntry || refEntry.role !== "agent-tool-call") {
    return { html: null };
  }
  const content = refEntry.toolInput?.content;
  const html =
    typeof content === "string" && content.length > 0 ? content : null;
  return { html, toolStatus: refEntry.status };
}

export default function JarvisHtmlViewEntry(entry: HtmlViewEntry) {
  const dialogHistory = useJarvisStore((state) => state.dialogHistory);
  const title = getHtmlViewEntryDisplayText(entry);
  const [tab, setTab] = useState("preview");

  const { html, toolStatus } = useMemo(
    () => findHtmlByReferenceEntryId(dialogHistory, entry.referenceEntryId),
    [dialogHistory, entry.referenceEntryId],
  );

  if (toolStatus === "failed") {
    return (
      <HtmlViewShell title={title}>
        <PlaceholderMessage className="text-destructive">
          Failed to render HTML (tool call error).
        </PlaceholderMessage>
      </HtmlViewShell>
    );
  }

  if (!html) {
    return (
      <HtmlViewShell title={title}>
        <PlaceholderMessage>
          {toolStatus === "pending"
            ? "Loading HTML…"
            : "HTML content unavailable."}
        </PlaceholderMessage>
      </HtmlViewShell>
    );
  }

  return (
    <HtmlViewShell title={title}>
      <Tabs
        value={tab}
        onValueChange={setTab}
        className="flex h-full min-h-0 flex-col gap-0"
      >
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
        <div className="relative min-h-0 flex-1">
          <TabsContent
            value="preview"
            keepMounted
            className="absolute inset-0 m-0 h-full data-hidden:hidden"
          >
            <iframe
              title={title}
              srcDoc={html}
              sandbox={IFRAME_SANDBOX}
              className="block h-full w-full border-0 bg-transparent"
            />
          </TabsContent>
          <TabsContent
            value="source"
            keepMounted
            className="absolute inset-0 m-0 h-full data-hidden:hidden"
          >
            <JarvisHtmlSource source={html} active={tab === "source"} />
          </TabsContent>
        </div>
      </Tabs>
    </HtmlViewShell>
  );
}

function PlaceholderMessage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex h-full items-center justify-center p-4 text-sm text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
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
          "flex w-full flex-col overflow-hidden rounded-xl border bg-muted/20",
          HTML_VIEW_HEIGHT,
        )}
      >
        {children}
      </div>
    </div>
  );
}

import type { HtmlViewEntry } from "@repo/shared/defines/jarvis";
import { timeFormat } from "@repo/shared/lib/time";
import { shortId } from "@repo/shared/lib/utils";
import { z } from "zod";
import type Jarvis from "../jarvis";
import { defineJarvisTool } from "../tool";

const MAX_HTML_BYTES = 512 * 1024;

/** Strip accidental markdown ```html / ``` wrappers from tool parameter content. */
export function normalizeHtmlSource(raw: string): string {
  let html = raw.trim();
  if (/^```html/i.test(html)) {
    html = html.replace(/^```html\s*/i, "");
  }
  if (html.endsWith("```")) {
    html = html.slice(0, -3).trimEnd();
  }
  return html.trim();
}

const HTML_VIEW_TOOL_INPUT_PLACEHOLDER =
  "[system] HTML omitted — see html-view entry below";

function replaceToolInputContentWithPlaceholder(
  jarvis: Jarvis,
  entryId: string,
) {
  const toolEntry = jarvis.state
    .getState()
    .dialogHistory.find((e) => e.id === entryId);
  if (toolEntry?.role === "agent-tool-call" && toolEntry.toolInput) {
    toolEntry.toolInput = {
      ...toolEntry.toolInput,
      content: HTML_VIEW_TOOL_INPUT_PLACEHOLDER,
    };
  }
}

const htmlViewTool = defineJarvisTool({
  name: "html-view",
  description:
    "Render a standalone HTML document in an embedded iframe—preferred channel for substantive user-facing answers (reports, comparisons, dashboards, multi-section guides). Build interactive, layered UI (tabs, filters, accordions), not long markdown-style scroll stacks. Reserve chat output for brief wrap-ups; pair with a short output line when needed.",
  inputSchema: z.object({
    title: z.string().describe("Short label shown above the HTML view"),
  }),
  inputContentDescription: `Complete HTML source for iframe rendering. Must be a full HTML document starting with \`<!DOCTYPE html>\` (include \`<html>\`, \`<head>\`, \`<body>\` as needed)`,
  execute: async (input, jarvis) => {
    const normalized = normalizeHtmlSource(input.content?.trim() ?? "");
    if (!normalized) {
      throw new Error("HTML content is required");
    }
    if (input.entryId) {
      replaceToolInputContentWithPlaceholder(jarvis, input.entryId);
    }
    const byteLength = Buffer.byteLength(normalized, "utf8");
    if (byteLength > MAX_HTML_BYTES) {
      throw new Error(
        `HTML too large (${byteLength} bytes; max ${MAX_HTML_BYTES} bytes)`,
      );
    }

    const entry: HtmlViewEntry = {
      id: shortId(),
      role: "html-view",
      from: "assistant",
      createdAt: Date.now(),
      createdTime: timeFormat(),
      title: input.title?.trim() || undefined,
      content: normalized,
    };
    jarvis.pushHistoryEntry(entry);
    return { success: true, id: entry.id, bytes: byteLength };
  },
});

export default htmlViewTool;

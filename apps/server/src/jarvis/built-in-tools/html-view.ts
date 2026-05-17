import type { HtmlViewEntry } from "@repo/shared/defines/jarvis";
import { timeFormat } from "@repo/shared/lib/time";
import { shortId } from "@repo/shared/lib/utils";
import { z } from "zod";
import { defineJarvisTool } from "../tool";
import type Jarvis from "../jarvis";

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

function persistNormalizedToolInput(
  jarvis: Jarvis,
  entryId: string,
  html: string,
) {
  const toolEntry = jarvis.state
    .getState()
    .dialogHistory.find((e) => e.id === entryId);
  if (toolEntry?.role === "agent-tool-call" && toolEntry.toolInput) {
    toolEntry.toolInput = { ...toolEntry.toolInput, content: html };
  }
}

const htmlViewTool = defineJarvisTool({
  name: "html-view",
  description:
    "Render a standalone HTML document in the chat for the user (shown in an embedded iframe). Use for rich layouts, interactive demos, dashboards, styled reports, or visualizations that need full HTML/CSS/JS—not for short text replies.",
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
      persistNormalizedToolInput(jarvis, input.entryId, normalized);
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
      referenceEntryId: input.entryId,
    };
    jarvis.pushHistoryEntry(entry);
    return { success: true, id: entry.id, bytes: byteLength };
  },
});

export default htmlViewTool;

import { tool } from "ai";
import z from "zod";

const HEADROOM_PROXY_URL = "http://localhost:8787";

const RETRIEVE_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_OUTPUT_BYTES = 1 * 1024 * 1024;

export default function createHeadroomRetrieveTool() {
  return tool({
    description:
      "Retrieve original content that Headroom compressed earlier in this conversation. " +
      "Use when you see markers like <<ccr:HASH ...>> or " +
      "'Retrieve more: hash=abc123' / '[N items compressed... hash=abc123]' in older tool output. " +
      "Pass the hash from the marker. Optionally pass query to search within cached data. " +
      "Cache TTL is about 5 minutes.",
    inputSchema: z.object({
      hash: z
        .string()
        .describe(
          "Hash from a compression marker (e.g. abc123 from hash=abc123)",
        ),
      query: z
        .string()
        .optional()
        .describe("Optional search filter within cached content"),
    }),
    inputExamples: [
      { input: { hash: "abc123def456" } },
      { input: { hash: "abc123def456", query: "error timeout" } },
    ],
    execute: async (input) => retrieveFromHeadroom(input.hash, input.query),
  });
}

async function retrieveFromHeadroom(
  hash: string,
  query?: string,
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RETRIEVE_TIMEOUT_MS);

  try {
    const response = await fetch(`${HEADROOM_PROXY_URL}/v1/retrieve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hash, ...(query ? { query } : {}) }),
      signal: controller.signal,
    });

    const body = (await response.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;

    if (!response.ok) {
      const detail =
        typeof body?.detail === "string"
          ? body.detail
          : typeof body?.error === "string"
            ? body.error
            : `HTTP ${response.status}`;
      return `headroom_retrieve failed (hash=${hash}): ${detail}`;
    }

    if (!body) {
      return `headroom_retrieve failed (hash=${hash}): empty response`;
    }

    if (query) {
      const results = Array.isArray(body.results) ? body.results : [];
      const count =
        typeof body.count === "number" ? body.count : results.length;
      return JSON.stringify({ hash, query, count, results }, null, 2);
    }

    if (typeof body.original_content !== "string") {
      return `headroom_retrieve failed (hash=${hash}): missing original_content`;
    }

    const meta = [
      typeof body.original_tokens === "number"
        ? `original_tokens=${body.original_tokens}`
        : null,
      typeof body.original_item_count === "number"
        ? `original_items=${body.original_item_count}`
        : null,
      typeof body.tool_name === "string"
        ? `source_tool=${body.tool_name}`
        : null,
    ]
      .filter(Boolean)
      .join(", ");

    const content = truncate(body.original_content);
    return meta ? `[${meta}]\n\n${content}` : content;
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? `timed out after ${RETRIEVE_TIMEOUT_MS}ms`
        : error instanceof Error
          ? error.message
          : String(error);
    return `headroom_retrieve failed (hash=${hash}): cannot reach Headroom at ${HEADROOM_PROXY_URL} — ${message}`;
  } finally {
    clearTimeout(timeout);
  }
}

function truncate(content: string): string {
  if (content.length <= DEFAULT_MAX_OUTPUT_BYTES) {
    return content;
  }
  return `${content.slice(0, DEFAULT_MAX_OUTPUT_BYTES)}\n...[truncated]`;
}

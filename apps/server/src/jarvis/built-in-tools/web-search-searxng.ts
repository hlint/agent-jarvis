import { z } from "zod";
import { defineJarvisTool } from "../tool";

/** SearXNG tab / category names (pick at most one per request). */
const SEARXNG_CATEGORIES = [
  "general",
  "videos",
  "social media",
  "images",
  "music",
  "packages",
  "it",
  "files",
  "books",
  "news",
  "apps",
  "software wikis",
  "science",
  "scientific publications",
  "web",
  "repos",
  "other",
  "currency",
  "icons",
  "weather",
  "map",
  "dictionaries",
  "shopping",
  "lyrics",
  "cargo",
  "movies",
  "translate",
  "radio",
  "q&a",
  "wikimedia",
  "define",
] as const;

/** Base URL without trailing slash; path `/search` is appended. */
function searxngBaseUrl(): string {
  const fromEnv =
    process.env.SEARXNG_SEARCH_URL?.trim() || process.env.SEARXNG_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const port = process.env.SEARXNG_PORT?.trim() || "4203";
  return `http://127.0.0.1:${port}`;
}

const webSearchSearxngTool = defineJarvisTool({
  name: "web-search-searxng",
  description: () =>
    "Local SearXNG (multi-engine). Use for: technical deep dives, OSS docs and forums, long-form and multi-angle research, packages/repos/science-style vertical search. " +
    "Use web-search-tavily for finance and breaking mainstream news.",
  inputSchema: z.object({
    query: z.string().min(1).describe("Search query (SearXNG parameter q)"),
    categories: z
      .enum(SEARXNG_CATEGORIES)
      .optional()
      .describe(
        "Optional: pick exactly one SearXNG category tab (omit for instance default / broad web).",
      ),
    engines: z
      .string()
      .optional()
      .describe("Comma-separated engine names to restrict which backends run"),
    language: z.string().optional().describe("Language hint, e.g. en, zh"),
    pageno: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe("Page number (1-based); omit for first page"),
    safesearch: z.coerce
      .number()
      .int()
      .min(0)
      .max(2)
      .optional()
      .describe("0 off, 1 moderate, 2 strict"),
    timeRange: z
      .enum(["day", "week", "month", "year"])
      .optional()
      .describe("Recency filter when supported by engines"),
    maxResults: z
      .number()
      .int()
      .min(1)
      .max(40)
      .optional()
      .describe("Max hits to return after merge (default 15)"),
  }),
  execute: async (input) => {
    const {
      query,
      categories,
      engines,
      language,
      pageno,
      safesearch,
      timeRange,
      maxResults = 15,
    } = input;

    const params = new URLSearchParams();
    params.set("q", query);
    params.set("format", "json");
    if (categories) params.set("categories", categories);
    if (engines) params.set("engines", engines);
    if (language) params.set("language", language);
    if (pageno != null) params.set("pageno", String(pageno));
    if (safesearch != null) params.set("safesearch", String(safesearch));
    if (timeRange) params.set("time_range", timeRange);

    const url = `${searxngBaseUrl()}/search`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: params.toString(),
    });

    const rawText = await res.text();
    if (!res.ok) {
      const hint =
        res.status === 403
          ? " (instance may disallow format=json in settings search.formats)"
          : "";
      throw new Error(
        `SearXNG HTTP ${res.status}${hint}: ${rawText.slice(0, 400)}`,
      );
    }

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(rawText) as Record<string, unknown>;
    } catch {
      throw new Error("SearXNG returned non-JSON body");
    }

    const results = Array.isArray(data.results) ? data.results : [];
    const sliced = results.slice(0, maxResults);

    return {
      query: data.query,
      number_of_results: data.number_of_results,
      results: sliced,
      unresponsive_engines: data.unresponsive_engines,
      suggestions: data.suggestions,
      corrections: data.corrections,
    };
  },
});

export default webSearchSearxngTool;

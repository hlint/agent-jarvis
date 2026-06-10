import { tavily } from "@tavily/core";
import { tool } from "ai";
import z from "zod";
import { requireTavilyApiKey, tavilyDisabledSuffix } from "./shared";

export default function createWebSearchTavilyTool(tavilyApiKey?: string) {
  return tool({
    description:
      "Tavily web search. Use for: finance, breaking and mainstream news, time-sensitive low-noise snippets for decisions." +
      tavilyDisabledSuffix(tavilyApiKey),
    inputSchema: z.object({
      query: z.string().min(1).describe("Search query"),
      topic: z.enum(["general", "news", "finance"]).describe("Topic category"),
    }),
    inputExamples: [
      {
        input: {
          query: "latest Fed interest rate decision",
          topic: "finance",
        },
      },
    ],
    execute: async (input) => {
      const client = tavily({ apiKey: requireTavilyApiKey(tavilyApiKey) });
      const { results } = await client.search(input.query, {
        topic: input.topic,
        searchDepth: "basic",
        maxResults: 9,
      });

      if (!results.length) return "No results found";
      return results;
    },
  });
}

import { tavily } from "@tavily/core";
import { env } from "bun";
import { z } from "zod";
import { defineJarvisTool } from "../tool";

const webSearchTool = defineJarvisTool({
  name: "web-search",
  description:
    "Search the web to discover information. Use when you need to find sources, answers, or articles and do not already have the exact URL. Returns search results (snippets, links, summary). Do NOT use for getting the current content of a specific known page—use web-extract with that URL instead.",
  inputSchema: z.object({
    query: z.string().describe("The query to search the web for"),
    topic: z
      .enum(["general", "news", "finance"])
      .describe("The topic of the search."),
    // timeRange: z
    //   .enum(["all", "one day", "one week", "one month", "one year"])
    //   .describe("The time range of the search."),
  }),
  execute: async (input) => {
    const { query, topic } = input;
    const client = tavily({ apiKey: env.TAVILY_API_KEY! });
    // const timeRangeMap = {
    //   all: undefined,
    //   "one day": "day",
    //   "one week": "week",
    //   "one month": "month",
    //   "one year": "year",
    // } as const;
    const results = await client.search(query, {
      topic: topic,
      searchDepth: "basic",
      maxResults: 9,
      // timeRange: timeRangeMap[timeRange],
      include_raw_content: "markdown",
    });
    return results;
  },
});

export default webSearchTool;

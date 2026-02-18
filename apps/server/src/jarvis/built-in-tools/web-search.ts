import { tavily } from "@tavily/core";
import { env } from "bun";
import { z } from "zod";
import { defineJarvisTool } from "../tool";

const webSearchTool = defineJarvisTool({
  name: "web-search",
  description:
    "Search the web. Use when you need to find info without a specific URL. For known URL content, use web-extract.",
  inputSchema: z.object({
    query: z.string().describe("Query"),
    topic: z.enum(["general", "news", "finance"]).describe("Topic"),
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

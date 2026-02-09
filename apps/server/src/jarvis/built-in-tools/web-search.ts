import { tavily } from "@tavily/core";
import { env } from "bun";
import { z } from "zod";
import { defineJarvisTool } from "../tool";

const webSearchTool = defineJarvisTool({
  name: "web-search",
  description:
    "Search the web for information. Return relevant websites with brief descriptions and a summary.",
  inputSchema: z.object({
    brief: z.string().describe("A brief description of this tool call"),
    query: z.string().describe("The query to search the web for"),
    topic: z
      .enum(["general", "news", "finance"])
      .describe("The topic of the search."),
    timeRange: z
      .enum(["all", "one day", "one week", "one month", "one year"])
      .describe("The time range of the search."),
  }),
  execute: async (input) => {
    const { query, topic, timeRange } = input;
    const client = tavily({ apiKey: env.TAVILY_API_KEY! });
    const timeRangeMap = {
      all: undefined,
      "one day": "day",
      "one week": "week",
      "one month": "month",
      "one year": "year",
    } as const;
    const results = await client.search(query, {
      topic: topic,
      searchDepth: "advanced",
      maxResults: 10,
      timeRange: timeRangeMap[timeRange],
      includeAnswer: true,
    });
    return results;
  },
});

export default webSearchTool;

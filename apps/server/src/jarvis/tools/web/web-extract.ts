import { tavily } from "@tavily/core";
import { tool } from "ai";
import z from "zod";
import { requireTavilyApiKey, tavilyDisabledSuffix } from "./shared";

export default function createWebExtractTool(tavilyApiKey?: string) {
  return tool({
    description:
      "Fetch and extract content from public internet URL(s). NOT for intranet/internal URLs (localhost, 192.168.x.x, 10.x.x.x, internal domains)." +
      tavilyDisabledSuffix(tavilyApiKey),
    inputSchema: z.object({
      urls: z
        .array(z.string().url())
        .min(1)
        .max(8)
        .describe("Public HTTP(S) URLs to extract"),
    }),
    inputExamples: [
      {
        input: {
          urls: ["https://example.com/docs/getting-started"],
        },
      },
    ],
    execute: async (input) => {
      const client = tavily({ apiKey: requireTavilyApiKey(tavilyApiKey) });
      const { results } = await client.extract(input.urls, {
        extractDepth: "advanced",
      });
      if (!results.length) {
        return "No results found";
      }
      return results;
    },
  });
}

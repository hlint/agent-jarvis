import { tavily } from "@tavily/core";
import { env } from "bun";
import { z } from "zod";
import { defineJarvisTool } from "../tool";

const webExtractTool = defineJarvisTool({
  name: "web-extract",
  description:
    "Fetch and extract the current content from one or more given URLs. Use when you already know the URL(s) and need the live content of that page—e.g. A blog post, a specific article, a dashboard, or any known link. Prefer this over web-search when the task is 'get what’s on this page right now'.",
  inputSchema: z.object({
    brief: z
      .string()
      .describe(
        "Short label for this fetch, e.g. which page or what you need from it",
      ),
    urls: z.array(z.string()).min(1).max(8),
  }),
  execute: async (input) => {
    const { urls } = input;
    const client = tavily({ apiKey: env.TAVILY_API_KEY! });
    const results = await client.extract(urls, {
      extractDepth: "advanced",
    });
    return results;
  },
});

export default webExtractTool;

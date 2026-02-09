import { tavily } from "@tavily/core";
import { env } from "bun";
import { z } from "zod";
import { defineJarvisTool } from "../tool";

const webExtractTool = defineJarvisTool({
  name: "web-extract",
  description: "Extract web page content from one or more specified URLs.",
  inputSchema: z.object({
    brief: z.string().describe("A brief description of this tool call"),
    urls: z.array(z.string()).min(1).max(8),
  }),
  execute: async (input) => {
    const { urls } = input;
    const client = tavily({ apiKey: env.TAVILY_API_KEY! });
    const results = await client.extract(urls, { extractDepth: "advanced" });
    return results;
  },
});

export default webExtractTool;

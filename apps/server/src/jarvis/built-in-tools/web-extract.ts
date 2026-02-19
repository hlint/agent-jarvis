import { tavily } from "@tavily/core";
import { env } from "bun";
import { z } from "zod";
import { defineJarvisTool } from "../tool";

const toolDisabled = !env.TAVILY_API_KEY;

const webExtractTool = defineJarvisTool({
  name: "web-extract",
  description:
    "Fetch and extract content from given URL(s). " +
    (toolDisabled ? "(Tool disabled due to missing env.TAVILY_API_KEY.)" : ""),
  inputSchema: z.object({
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

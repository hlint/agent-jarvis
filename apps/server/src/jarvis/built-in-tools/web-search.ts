import { getLanguageModel } from "@repo/shared/llm/get-model";
import { tavily } from "@tavily/core";
import { generateText } from "ai";
import { z } from "zod";
import { defineJarvisTool } from "../tool";

const ENABLE_SUB_AGENT = false;

const webSearchTool = defineJarvisTool({
  name: "web-search",
  description: (jarvis) =>
    "Search the public internet. Use when you need to find info without a specific URL. For known URL content, use web-extract. NOT for intranet/internal resources." +
    (jarvis.config.getConfig().tavilyApiKey
      ? ""
      : "DISABLED due to missing Tavily API key"),
  inputSchema: z.object({
    query: z.string().describe("Query"),
    topic: z.enum(["general", "news", "finance"]).describe("Topic"),
  }),
  execute: async (input, jarvis) => {
    const { query, topic } = input;
    const tavilyApiKey = jarvis.config.getConfig().tavilyApiKey;
    if (!tavilyApiKey) {
      throw new Error("DISABLED due to missing Tavily API key");
    }
    const client = tavily({ apiKey: tavilyApiKey });
    const { results } = await client.search(query, {
      topic: topic,
      searchDepth: "basic",
      maxResults: 9,
    });

    if (!results.length) return "No results found";

    if (!ENABLE_SUB_AGENT) {
      return results;
    }
    const chatProvider = jarvis.config.getAiProvider("CHAT")!;
    const model = getLanguageModel(chatProvider);
    const { text } = await generateText({
      model,
      providerOptions: chatProvider.providerOptions,
      messages: [
        { role: "system", content: SearchResultsDistillerPrompt },
        {
          role: "user",
          content: `Search query: ${query}\n\nRaw results (JSON):\n${JSON.stringify(results, null, 2)}`,
        },
      ],
    });
    return text;
  },
});

export default webSearchTool;

const SearchResultsDistillerPrompt = `
Role: You are a Search Results Distiller. Your task is to refine web search results into a compact, high-value summary for another AI Agent.

Refinement requirements:
1. **Condense**: Extract core facts from each result. Remove filler words, transitions, and redundant phrasing.
2. **Deduplicate**: When multiple results state the same fact, keep it only once (in the most relevant/complete result).
3. **Preserve key info**: Keep names, places, dates, numbers, cause-effect relations, and unique insights.
4. **Order by relevance**: Place higher-score results first when ordering. Score is provided in raw results.
5. **Skip low-value results**: Omit results that add no new information after refinement.

Output format (strict, one block per result):

# Title1

URL1

condensed content

-----------------------

# Title2

URL2

condensed content

-----------------------

(Repeat for each result. Use "-----------------------" as separator between blocks. No trailing separator.)
`;

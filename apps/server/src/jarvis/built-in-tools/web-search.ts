import { getLanguageModel } from "@repo/shared/llm/get-model";
import { tavily } from "@tavily/core";
import { generateText } from "ai";
import { env } from "bun";
import { z } from "zod";
import { aiOutputProvider, aiThinkProvider } from "../ai-providers";
import { defineJarvisTool } from "../tool";

const toolDisabled = !env.TAVILY_API_KEY;
const toolDisabledMessage = "Tool disabled due to missing env.TAVILY_API_KEY.";

const webSearchTool = defineJarvisTool({
  name: "web-search",
  description:
    "Search the web. Use when you need to find info without a specific URL. For known URL content, use web-extract." +
    (toolDisabled ? `(${toolDisabledMessage})` : ""),
  inputSchema: z.object({
    query: z.string().describe("Query"),
    topic: z.enum(["general", "news", "finance"]).describe("Topic"),
  }),
  execute: async (input) => {
    if (toolDisabled) {
      throw new Error(toolDisabledMessage);
    }
    const { query, topic } = input;
    const client = tavily({ apiKey: env.TAVILY_API_KEY! });
    const { results } = await client.search(query, {
      topic: topic,
      searchDepth: "basic",
      maxResults: 9,
    });

    if (!results.length) return "";

    const model = getLanguageModel(aiOutputProvider ?? aiThinkProvider!);
    const { text } = await generateText({
      model,
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

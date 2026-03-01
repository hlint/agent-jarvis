import { getLanguageModel } from "@repo/shared/llm/get-model";
import { tavily } from "@tavily/core";
import { generateText } from "ai";
import { z } from "zod";
import { defineJarvisTool } from "../tool";

const ENABLE_SUB_AGENT = false;

const webExtractTool = defineJarvisTool({
  name: "web-extract",
  description: (jarvis) =>
    "Fetch and extract content from public internet URL(s). NOT for intranet/internal URLs (localhost, 192.168.x.x, 10.x.x.x, internal domains). " +
    (jarvis.config.getConfig().tavilyApiKey
      ? ""
      : "DISABLED due to missing Tavily API key"),
  inputSchema: z.object({
    urls: z.array(z.string()).min(1).max(8),
  }),
  execute: async (input, jarvis) => {
    const { urls } = input;
    const tavilyApiKey = jarvis.config.getConfig().tavilyApiKey;
    if (!tavilyApiKey) {
      throw new Error("DISABLED due to missing Tavily API key");
    }
    const client = tavily({ apiKey: tavilyApiKey });
    const { results } = await client.extract(urls, {
      extractDepth: "advanced",
    });
    const firstResult = results[0];
    if (!firstResult) {
      return "No results found";
    }
    if (!ENABLE_SUB_AGENT) {
      return results;
    }
    const { text } = await generateText({
      model: getLanguageModel(jarvis.config.getAiProvider("CHAT")!),
      messages: [
        {
          role: "system",
          content: ContentDistillerPrompt,
        },
        { role: "user", content: firstResult.rawContent },
      ],
    });
    return {
      title: firstResult.title,
      content: text,
    };
  },
});

export default webExtractTool;

const ContentDistillerPrompt = `
Role: You are a highly efficient Web Content Distiller. Your goal is to strip away the "noise" of a webpage and provide a clean, high-density Markdown summary for another AI Agent to process.

Task Instructions:

- Remove the Junk: Eliminate all navigation menus, footers, sidebars, advertisements, social media buttons, and legal disclaimers.
- Preserve Metadata: Extract the Page Title, Primary Author, and Publication Date if available.
- Extract Core Content: Focus on the main body of the article or document. Keep facts, data points, code snippets, and key arguments intact.
- Format as Markdown: Use hierarchical headers (##, ###), bullet points for lists, and Markdown tables for any data sets.
- Maintain Link Context: Keep important functional URLs (like "Download" or "Source") but remove tracking/marketing links.
- Be Concise but Complete: Do not lose the original intent or nuanced data, but use a professional, information-dense tone.

Output Format:

## Summary

[2-3 sentence high-level overview]

## Main Content

[Structured extracted content in Markdown]
`;

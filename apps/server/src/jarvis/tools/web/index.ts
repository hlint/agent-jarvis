import type { ToolSet } from "ai";
import type Jarvis from "../..";
import createWebExtractTool from "./web-extract";
import createWebSearchSearxngTool from "./web-search-searxng";
import createWebSearchTavilyTool from "./web-search-tavily";

export default function createWebTools(jarvis: Jarvis): ToolSet {
  const tavilyApiKey = jarvis.config.getConfig().tavilyApiKey;

  return {
    ...(jarvis.config.isWithComputer()
      ? { web_search_searxng: createWebSearchSearxngTool() }
      : {}),
    web_search_tavily: createWebSearchTavilyTool(tavilyApiKey),
    web_extract: createWebExtractTool(tavilyApiKey),
  };
}

/** Base URL without trailing slash; path `/search` is appended. */
export function searxngBaseUrl(): string {
  const fromEnv =
    process.env.SEARXNG_SEARCH_URL?.trim() || process.env.SEARXNG_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const port = process.env.SEARXNG_PORT?.trim() || "4203";
  return `http://127.0.0.1:${port}`;
}

export function tavilyDisabledSuffix(tavilyApiKey?: string): string {
  return tavilyApiKey
    ? ""
    : " DISABLED: missing Tavily API key. Set tavilyApiKey in config.json.";
}

export function requireTavilyApiKey(tavilyApiKey?: string): string {
  if (!tavilyApiKey) {
    throw new Error("DISABLED due to missing Tavily API key");
  }
  return tavilyApiKey;
}

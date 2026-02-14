import { z } from "zod";
import { defineJarvisTool } from "../tool";

const weatherForecastTool = defineJarvisTool({
  name: "weather",
  description:
    "Get the current and next three days weather for a specified city. If wttr.in is temporarily unavailable, try using the web tool to get the result.",
  inputSchema: z.object({
    city: z.string().describe("The city to get the weather for"),
  }),
  execute: async ({ city }) => {
    const TIMEOUT_MS = 10_000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const result = await fetch(
        `https://wttr.in/${encodeURIComponent(city)}?format=j2`,
        { signal: controller.signal },
      );
      const data = await result.json();
      return data;
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return {
          error: `Weather request timed out (${TIMEOUT_MS / 1000}s). wttr.in may be slow or unavailable; try again later.`,
        };
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  },
});

export default weatherForecastTool;

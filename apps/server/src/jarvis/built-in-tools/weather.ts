import { z } from "zod";
import { defineJarvisTool } from "../tool";

const weatherForecastTool = defineJarvisTool({
  name: "weather",
  description:
    "Get the current and next three days weather for a specified city",
  inputSchema: z.object({
    brief: z
      .string()
      .describe(
        "Short label for this weather request, e.g. location or purpose",
      ),
    city: z.string().describe("The city to get the weather for"),
  }),
  execute: async ({ city }) => {
    const result = await fetch(
      `https://wttr.in/${encodeURIComponent(city)}?format=j2`,
    );
    const data = await result.json();
    return data;
  },
});

export default weatherForecastTool;

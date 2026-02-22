import { env } from "bun";
import { createClient } from "pexels";
import { z } from "zod";
import { defineJarvisTool } from "../tool";

const apiKey = env.PEXELS_API_KEY;
const toolDisabled = !apiKey;
const toolDisabledMessage = "Tool disabled due to missing env.PEXELS_API_KEY.";

const imageSearchTool = defineJarvisTool({
  name: "image-search",
  description:
    "Search for stock images (nature, cities, business, lifestyle...). Use English keywords. Not suitable for precise searches (specific person, product model, logo). " +
    (toolDisabled ? `(${toolDisabledMessage})` : ""),
  inputSchema: z.object({
    keywords: z
      .string()
      .min(1)
      .max(100)
      .describe(
        "Search keywords, English only (e.g. 'Akita Inu', 'sunset beach')",
      ),
  }),
  execute: async (input) => {
    if (toolDisabled) {
      throw new Error(toolDisabledMessage);
    }
    const { keywords } = input;
    const client = createClient(apiKey!);
    const results = await client.photos.search({
      query: keywords,
      per_page: 16,
      orientation: "landscape",
    });

    if (!results || "error" in results) {
      throw new Error(
        (results as { error?: string })?.error ?? "Pexels API error",
      );
    }

    const photos = results.photos;
    return photos.map((t) => ({
      src: t.src?.landscape ?? "",
      srcSmall: t.src?.small ?? "",
      alt: t.alt ?? "",
    }));
  },
});

export default imageSearchTool;

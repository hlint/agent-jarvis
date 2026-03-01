import { createClient } from "pexels";
import { z } from "zod";
import { defineJarvisTool } from "../tool";

const imageSearchTool = defineJarvisTool({
  name: "image-search",
  description: (jarvis) =>
    "Search for stock images (nature, cities, business, lifestyle...). Use English keywords. Not suitable for precise searches (specific person, product model, logo). " +
    (jarvis.config.getConfig().pexelsApiKey
      ? ""
      : "DISABLED due to missing Pexels API key"),
  inputSchema: z.object({
    keywords: z
      .string()
      .min(1)
      .max(100)
      .describe(
        "Search keywords, English only (e.g. 'Akita Inu', 'sunset beach')",
      ),
  }),
  execute: async (input, jarvis) => {
    const { keywords } = input;
    const pexelsApiKey = jarvis.config.getConfig().pexelsApiKey;
    if (!pexelsApiKey) {
      throw new Error("DISABLED due to missing Pexels API key");
    }
    const client = createClient(pexelsApiKey);
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

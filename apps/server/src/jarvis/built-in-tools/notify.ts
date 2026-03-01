import { z } from "zod";
import { defineJarvisTool } from "../tool";

const notifyTool = defineJarvisTool({
  name: "notify",
  description: (jarvis) =>
    "Push notification to user's cell phone. Suitable for sending short and important messages." +
    (jarvis.config.getConfig().ntfyTopic
      ? ""
      : "DISABLED due to missing NTFY topic"),
  inputSchema: z.object({
    message: z.string().describe("Message"),
    withWebNavigation: z
      .boolean()
      .optional()
      .describe("If true, click opens web Chat UI"),
  }),
  execute: async ({ message, withWebNavigation }, jarvis) => {
    const topic = jarvis.config.getConfig().ntfyTopic;
    const websiteUrl = jarvis.websiteUrl;
    if (!topic) {
      throw new Error("DISABLED due to missing NTFY topic");
    }
    fetch(`https://ntfy.sh/${topic}`, {
      method: "POST",
      headers: {
        Click: withWebNavigation ? websiteUrl || "" : "",
      },
      body: message,
    });
  },
});

export default notifyTool;

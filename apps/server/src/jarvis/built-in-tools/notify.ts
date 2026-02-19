import { z } from "zod";
import { defineJarvisTool } from "../tool";

// 鉴于已经集成了Telegram Bot，这个工具暂时废弃
const notifyTool = defineJarvisTool({
  name: "notify",
  description: "Push notification to user.",
  inputSchema: z.object({
    message: z.string().describe("Message"),
    withWebNavigation: z
      .boolean()
      .optional()
      .describe("If true, click opens chat website"),
  }),
  execute: async ({ message, withWebNavigation }) => {
    const topic = process.env.NTFY_TOPIC;
    const websiteUrl = process.env.WEBSITE_URL;
    if (!topic) {
      throw new Error("env.NTFY_TOPIC is not set");
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

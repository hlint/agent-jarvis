import { env } from "bun";
import { z } from "zod";
import { defineJarvisTool } from "../tool";

const toolDisabled = !env.NTFY_TOPIC;
const toolDisabledMessage = "Tool disabled due to missing env.NTFY_TOPIC.";

const notifyTool = defineJarvisTool({
  name: "notify",
  description:
    "Push notification to user's cell phone. Suitable for sending short and important messages." +
    (toolDisabled ? `(${toolDisabledMessage})` : ""),
  inputSchema: z.object({
    message: z.string().describe("Message"),
    withWebNavigation: z
      .boolean()
      .optional()
      .describe("If true, click opens web Chat UI"),
  }),
  execute: async ({ message, withWebNavigation }) => {
    const topic = process.env.NTFY_TOPIC;
    const websiteUrl = process.env.WEBSITE_URL;
    if (!topic) {
      throw new Error(toolDisabledMessage);
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

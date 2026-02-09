import { z } from "zod";
import { defineJarvisTool } from "../tool";

const notifyTool = defineJarvisTool({
  name: "notify",
  description:
    "Notify user's devices with a message. This tool is used to notify the user about important events or tasks.",
  inputSchema: z.object({
    brief: z.string().describe("A brief description of this tool call"),
    message: z.string().describe("The message to notify the user with"),
  }),
  execute: async ({ message }) => {
    const topic = process.env.NTFY_TOPIC;
    const websiteUrl = process.env.WEBSITE_URL;
    if (!topic) {
      throw new Error("env.NTFY_TOPIC is not set");
    }
    fetch(`https://ntfy.sh/${topic}`, {
      method: "POST",
      headers: {
        Click: websiteUrl || "",
      },
      body: message,
    });
  },
});

export default notifyTool;

import { z } from "zod";
import { defineJarvisTool } from "../tool";

const notifyTool = defineJarvisTool({
  name: "notify",
  description:
    "Notify user's cellphone with a message. This tool is used to notify the user about important events or tasks.",
  inputSchema: z.object({
    message: z.string().describe("The message to notify the user with"),
    withWebNavigation: z
      .boolean()
      .describe(
        "If true: clicking the notification opens the project's deployed site (Jarvis web app). Use when this is a heads-up only and the user should open the app to see full details. If false: no link on click; use for simple alerts or when the message is self-contained and the user does not need to open the web app.",
      ),
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

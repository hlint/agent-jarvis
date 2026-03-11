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
  }),
  execute: async ({ message }, jarvis) => {
    const topic = jarvis.config.getConfig().ntfyTopic;
    if (!topic) {
      throw new Error("DISABLED due to missing NTFY topic");
    }
    fetch(`https://ntfy.sh/${topic}`, {
      method: "POST",
      body: message,
    });
  },
});

export default notifyTool;

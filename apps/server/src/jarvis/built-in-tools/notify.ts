import { z } from "zod";
import { defineJarvisTool } from "../tool";

const notifyTool = defineJarvisTool({
  name: "notify",
  description: (jarvis) =>
    "Push notification to user's cell phone. Suitable for sending short and important messages." +
    (jarvis.config.getConfig().ntfyTopic
      ? ""
      : "DISABLED due to missing NTFY topic"),
  inputSchema: z.object({}),
  inputContentDescription: "Message to send",
  execute: async (input, jarvis) => {
    const topic = jarvis.config.getConfig().ntfyTopic;
    if (!topic) {
      throw new Error("DISABLED due to missing NTFY topic");
    }
    fetch(`https://ntfy.sh/${topic}`, {
      method: "POST",
      body: input.content ?? "",
    });
  },
});

export default notifyTool;

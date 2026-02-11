import { z } from "zod";
import { defineJarvisTool } from "../tool";

const thinkTool = defineJarvisTool({
  name: "think",
  description:
    "Record a step of your reasoning (analysis, plan, or conclusion) before replying or calling other tools. Use when you want to make your thinking explicit: e.g. clarifying user intent, summarizing what you know vs what you need, or choosing the next action. The content is stored in the conversation and is not shown as the final reply to the user.",
  inputSchema: z.object({
    brief: z
      .string()
      .describe(
        "Short label for this reasoning step, e.g. intent / status / plan / next action",
      ),
    thought: z
      .string()
      .describe(
        "Your reasoning content: e.g. intent interpretation, current state, plan, or why you chose an action.",
      ),
  }),
  execute: async () => {
    return null;
  },
});

export default thinkTool;

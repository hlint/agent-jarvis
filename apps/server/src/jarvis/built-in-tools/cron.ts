import { z } from "zod";
import { defineJarvisTool } from "../tool";

export const listCronTasksTool = defineJarvisTool({
  name: "list-cron-tasks",
  description: "List all cron tasks",
  inputSchema: z.object({
    brief: z.string().describe("Brief label"),
  }),
  execute: async (_, jarvis) => {
    return jarvis.cron.listCronTasks();
  },
});

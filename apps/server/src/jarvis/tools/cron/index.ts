import { tool } from "ai";
import z from "zod";
import type Jarvis from "../..";

export default function createListCronTasksTool(jarvis: Jarvis) {
  return tool({
    description:
      "List all scheduled cron tasks (metadata and next run time). Always reads the latest files from disk. Task definitions live in cron-tasks/*.md — use runtime-relative paths (cron-tasks/name.md), not runtime-template/. Tasks with loadError failed to parse; fix the file and list again. For creating or editing tasks, read skills/cron/SKILL.md.",
    inputSchema: z.object({}),
    execute: async () => {
      const tasks = jarvis.cron.listCronTasks();
      return {
        tasks,
        summary: tasks.length
          ? `${tasks.length} task(s): ${tasks.filter((t) => t.enabled && !t.loadError).length} enabled, ${tasks.filter((t) => t.loadError).length} with load errors`
          : "No cron task files found in cron-tasks/",
      };
    },
  });
}

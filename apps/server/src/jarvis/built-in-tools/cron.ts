import { z } from "zod";
import { defineJarvisTool } from "../tool";

export const createCronTaskTool = defineJarvisTool({
  name: "create-cron-task",
  description:
    "Create a new cron task. The tool will return the created task with the next trigger time.",
  inputSchema: z.object({
    brief: z
      .string()
      .describe(
        "Short label for this create, e.g. task name or schedule in a few words",
      ),
    name: z
      .string()
      .describe("The name of the task. For example: 'Daily Weather Forecast'"),
    description: z
      .string()
      .describe(
        "A self-contained, detailed description of the task, including all necessary context, inputs, and expected behavior so it can be executed correctly when the cron triggers in a future conversation without relying on prior chat context. Example: 'Get the current weather and forecast for the next 3 days for Beijing, China (city: Beijing, country: China), then notify the user with the results. Use the weather tool with location parameter set to Beijing, China.'",
      ),
    cronPattern: z
      .string()
      .describe(
        "The cron pattern to create the task. For example: '0 0 * * *'",
      ),
    oneTimeTrigger: z
      .boolean()
      .describe(
        "Whether the task is a one-time trigger. If true, the task will be deleted automatically after it is triggered.",
      ),
  }),
  execute: async (
    { name, cronPattern, description, oneTimeTrigger },
    jarvis,
  ) => {
    return jarvis.cron.createCronTask({
      name,
      cronPattern,
      description,
      oneTimeTrigger,
    });
  },
});

export const removeCronTaskTool = defineJarvisTool({
  name: "remove-cron-task",
  description: "Remove a cron task",
  inputSchema: z.object({
    brief: z
      .string()
      .describe("Short label for this removal, e.g. which task or why"),
    id: z.string().describe("The id of the task to remove"),
  }),
  execute: async ({ id }, jarvis) => {
    jarvis.cron.removeCronTask(id);
    return { success: true };
  },
});

export const listCronTasksTool = defineJarvisTool({
  name: "list-cron-tasks",
  description: "List all cron tasks",
  inputSchema: z.object({
    brief: z
      .string()
      .describe("Short label for this list, e.g. 'list cron tasks' or purpose"),
  }),
  execute: async (_, jarvis) => {
    return jarvis.cron.listCronTasks();
  },
});

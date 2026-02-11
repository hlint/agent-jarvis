import { z } from "zod";
import { defineJarvisTool } from "../tool";

const CRON_NAME_REGEX = /^[a-zA-Z0-9_-]+$/;
const CRON_NAME_MSG = "仅允许字母、数字、连字符 - 和下划线 _";

export const upsertCronTaskTool = defineJarvisTool({
  name: "upsert-cron-task",
  description:
    "Create or update a cron task by name. Use mode to specify create or update: create checks the task name does not exist; update checks the task exists. name must use only letters, numbers, - and _.",
  inputSchema: z.object({
    brief: z
      .string()
      .describe(
        "Short label, e.g. 'create daily-weather task' or 'update my-reminder'",
      ),
    mode: z
      .enum(["create", "update"])
      .describe(
        "create: add a new task (name must not exist). update: modify an existing task (name must exist).",
      ),
    name: z
      .string()
      .regex(CRON_NAME_REGEX, CRON_NAME_MSG)
      .describe(
        "Unique task name (e.g. daily-weather, my-reminder). When updating, the current name.",
      ),
    newName: z
      .string()
      .regex(CRON_NAME_REGEX, CRON_NAME_MSG)
      .optional()
      .describe("New name when updating (optional)."),
    newDescription: z
      .string()
      .optional()
      .describe(
        "Self-contained task description for when the cron triggers. Required when creating.",
      ),
    newCronPattern: z
      .string()
      .optional()
      .describe("Cron pattern (e.g. '0 0 * * *'). Required when creating."),
    newOneTimeTrigger: z
      .boolean()
      .optional()
      .describe(
        "If true, task is deleted after one trigger. Optional when updating.",
      ),
  }),
  execute: async (
    { mode, name, newName, newDescription, newCronPattern, newOneTimeTrigger },
    jarvis,
  ) => {
    const exists = jarvis.cron
      .listCronTasks()
      .some((t: { name: string }) => t.name === name);

    if (mode === "create") {
      if (exists) {
        return {
          success: false,
          message: `无法创建：已存在名为「${name}」的定时任务。`,
        };
      }
      if (newDescription === undefined || newCronPattern === undefined) {
        return {
          success: false,
          message: "创建定时任务时 description 和 cronPattern 为必填。",
        };
      }
      return jarvis.cron.createCronTask({
        name,
        description: newDescription,
        cronPattern: newCronPattern,
        oneTimeTrigger: newOneTimeTrigger ?? false,
      });
    }

    // mode === "update"
    if (!exists) {
      return {
        success: false,
        message: `无法更新：未找到名为「${name}」的定时任务。`,
      };
    }
    const result = jarvis.cron.updateCronTask(name, {
      name: newName,
      description: newDescription,
      cronPattern: newCronPattern,
      oneTimeTrigger: newOneTimeTrigger ?? false,
    });
    if (result === null) {
      return {
        success: false,
        message: `新 name 已被其他任务占用。`,
      };
    }
    return result;
  },
});

export const removeCronTaskTool = defineJarvisTool({
  name: "remove-cron-task",
  description: "Remove a cron task by its name",
  inputSchema: z.object({
    brief: z
      .string()
      .describe("Short label for this removal, e.g. which task or why"),
    name: z
      .string()
      .regex(CRON_NAME_REGEX, CRON_NAME_MSG)
      .describe("The name of the task to remove"),
  }),
  execute: async ({ name }, jarvis) => {
    jarvis.cron.removeCronTask(name);
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

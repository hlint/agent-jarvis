import { z } from "zod";
import { defineJarvisTool } from "../tool";

const CRON_NAME_REGEX = /^[a-zA-Z0-9_-]+$/;
const CRON_NAME_MSG = "仅允许字母、数字、连字符 - 和下划线 _";

export const upsertCronTaskTool = defineJarvisTool({
  name: "upsert-cron-task",
  description:
    "Create or update a cron task by name. Use mode to specify create or update: create checks the task name does not exist; update checks the task exists. name must use only letters, numbers, - and _.",
  inputSchema: z.object({
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
    data: z
      .object({
        name: z
          .string()
          .regex(CRON_NAME_REGEX, CRON_NAME_MSG)
          .optional()
          .describe("New name when updating (optional)."),
        description: z
          .string()
          .optional()
          .describe(
            "Self-contained task description for when the cron triggers. Required when creating.",
          ),
        cronPattern: z
          .string()
          .optional()
          .describe("Cron pattern (e.g. '0 0 * * *'). Required when creating."),
        oneTimeTrigger: z
          .boolean()
          .optional()
          .describe(
            "If true, task is deleted after one trigger. Optional when updating.",
          ),
        enabled: z
          .boolean()
          .optional()
          .describe(
            "If false, the task is paused and the timer will not run. Optional when updating.",
          ),
      })
      .describe("Task data fields to create or update."),
  }),
  execute: async ({ mode, name, data }, jarvis) => {
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
      if (data.description === undefined || data.cronPattern === undefined) {
        return {
          success: false,
          message:
            "创建定时任务时 data.description 和 data.cronPattern 为必填。",
        };
      }
      return jarvis.cron.createCronTask({
        name,
        description: data.description,
        cronPattern: data.cronPattern,
        oneTimeTrigger: data.oneTimeTrigger ?? false,
        enabled: data.enabled !== false,
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
      name: data.name,
      description: data.description,
      cronPattern: data.cronPattern,
      oneTimeTrigger: data.oneTimeTrigger ?? false,
      enabled: data.enabled,
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

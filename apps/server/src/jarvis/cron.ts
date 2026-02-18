import { watch } from "node:fs";
import { join } from "node:path";
import { timeFormat } from "@repo/shared/lib/time";
import { CronJob } from "cron";
import { omit } from "es-toolkit";
import fm from "front-matter";
import fs from "fs-extra";
import { nanoid } from "nanoid";
import z from "zod";
import { DIR_CRON_TASKS } from "./defines";
import type Jarvis from "./jarvis";
import { stringifyFrontmatterMd } from "./utils";

const cronTaskMetadataSchema = z.object({
  name: z.string().regex(/^[a-zA-Z0-9_-]+$/),
  description: z.string(),
  cronPattern: z.string(),
  oneTimeOnly: z.boolean(),
  enabled: z.boolean(),
});

type CronTask = z.infer<typeof cronTaskMetadataSchema> & {
  body: string;
  cronJob?: CronJob;
};

export default class JarvisCron {
  private jarvis: Jarvis;
  private cronTasks: CronTask[] = [];

  constructor(jarvis: Jarvis) {
    this.jarvis = jarvis;
  }

  init() {
    this.loadCronTasks();
    this.resetCronJobs();
    this.watchChanges();
  }

  private watchChanges() {
    watch(DIR_CRON_TASKS, { recursive: true }, (_event, filename) => {
      if (filename?.endsWith("CRON.md")) {
        this.loadCronTasks();
        this.resetCronJobs();
      }
    });
  }

  private loadCronTasks() {
    const dirs = fs.readdirSync(DIR_CRON_TASKS);
    const cronTasks = dirs.map((dir) => {
      const raw = fs.readFileSync(
        join(DIR_CRON_TASKS, dir, "CRON.md"),
        "utf-8",
      );
      const { attributes } = fm(raw);
      const metadata = cronTaskMetadataSchema.parse(attributes);
      return {
        ...metadata,
        body: raw,
      };
    });
    this.cronTasks = cronTasks;
  }

  private resetCronJobs() {
    this.cronTasks.forEach((task) => {
      if (task.cronJob) {
        task.cronJob.stop();
      }
      task.cronJob = new CronJob(task.cronPattern, () => {
        this.jarvis.pushHistoryEntry({
          id: nanoid(6),
          role: "system-event",
          createdTime: timeFormat(),
          brief: `Cron task ${task.name} triggered`,
          content: task.body,
          data: {
            ...omit(task, ["body", "cronJob"]),
          },
        });
        this.jarvis.wakeUp();
        if (task.oneTimeOnly) {
          this.handleOneTimeOnly(task.name);
        }
      });
      if (task.enabled) {
        task.cronJob.start();
      }
    });
  }

  listCronTasks() {
    return this.cronTasks.map((task) => ({
      ...omit(task, ["body", "cronJob"]),
      nextTriggerTime: getNextTriggerTime(task.cronPattern),
    }));
  }

  private handleOneTimeOnly(name: string) {
    const taskPath = join(DIR_CRON_TASKS, name, "CRON.md");
    const content = fs.readFileSync(taskPath, "utf-8");
    const { attributes, body } = fm(content);
    const metadata = cronTaskMetadataSchema.parse(attributes);
    metadata.enabled = false;
    fs.writeFileSync(taskPath, stringifyFrontmatterMd(metadata, body));
  }
}

function getNextTriggerTime(cronPattern: string) {
  const cronJob = new CronJob(cronPattern, () => {});
  return timeFormat(cronJob.nextDate().toJSDate().getTime());
}

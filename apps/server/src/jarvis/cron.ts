import { join } from "node:path";
import { timeFormat } from "@repo/shared/lib/time";
import chokidar from "chokidar";
import { CronJob } from "cron";
import { debounce, omit } from "es-toolkit";
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
    const reloadCron = debounce(() => {
      this.loadCronTasks();
      this.resetCronJobs();
    }, 100);
    chokidar
      .watch(DIR_CRON_TASKS, { ignoreInitial: true })
      .on("all", reloadCron);
  }

  private loadCronTasks() {
    this.stopAllCronJobs();
    const dirs = fs.existsSync(DIR_CRON_TASKS)
      ? fs.readdirSync(DIR_CRON_TASKS)
      : [];
    const cronTasks: CronTask[] = [];
    for (const dir of dirs) {
      const taskPath = join(DIR_CRON_TASKS, dir, "CRON.md");
      if (!fs.existsSync(taskPath)) continue;
      try {
        const raw = fs.readFileSync(taskPath, "utf-8");
        const { attributes } = fm(raw);
        const metadata = cronTaskMetadataSchema.parse(attributes);
        cronTasks.push({
          ...metadata,
          body: raw,
        });
      } catch {
        cronTasks.push({
          name: dir,
          description: "加载失败：格式错误",
          cronPattern: "0 0 1 1 *",
          oneTimeOnly: false,
          enabled: false,
          body: "",
        });
      }
    }
    this.cronTasks = cronTasks;
  }

  private resetCronJobs() {
    this.stopAllCronJobs();
    this.cronTasks.forEach((task) => {
      task.cronJob = new CronJob(task.cronPattern, () => {
        this.jarvis.pushHistoryEntry({
          id: nanoid(6),
          role: "system-event",
          createdAt: Date.now(),
          createdTime: timeFormat(),
          brief: `Cron task ${task.name} triggered`,
          content: task.body,
          data: {
            ...omit(task, ["body", "cronJob"]),
          },
        });
        this.jarvis.wakeUp();
        if (task.oneTimeOnly) {
          this.writeOneTimeOnlyFile(task.name);
          task.cronJob?.stop();
        }
      });
      if (task.enabled) {
        task.cronJob.start();
      }
    });
  }

  private stopAllCronJobs() {
    this.cronTasks.forEach((task) => {
      if (task.cronJob) {
        task.cronJob.stop();
      }
    });
  }

  listCronTasks() {
    return this.cronTasks.map((task) => ({
      ...omit(task, ["body", "cronJob"]),
      nextTriggerTime: getNextTriggerTime(task.cronPattern),
    }));
  }

  private writeOneTimeOnlyFile(name: string) {
    try {
      const taskPath = join(DIR_CRON_TASKS, name, "CRON.md");
      const content = fs.readFileSync(taskPath, "utf-8");
      const { attributes, body } = fm(content);
      const metadata = cronTaskMetadataSchema.parse(attributes);
      metadata.enabled = false;
      fs.writeFileSync(taskPath, stringifyFrontmatterMd(metadata, body));
    } catch {
      // skip
    }
  }
}

function getNextTriggerTime(cronPattern: string) {
  const cronJob = new CronJob(cronPattern, () => {});
  return timeFormat(cronJob.nextDate().toJSDate().getTime());
}

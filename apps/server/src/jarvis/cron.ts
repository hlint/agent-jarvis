import { join } from "node:path";
import { timeFormat } from "@repo/shared/lib/time";
import chokidar from "chokidar";
import { CronJob } from "cron";
import { debounce } from "es-toolkit";
import fm from "front-matter";
import fs from "fs-extra";
import z from "zod";
import { toDisplayPath } from "../lib/runtime-path";
import { stringifyFrontmatterMd } from "../lib/stringify-frontmatter";
import type Jarvis from ".";
import { DIR_CRON_TASKS } from "./defines";

const cronTaskMetadataSchema = z.object({
  description: z.string(),
  cronPattern: z.string(),
  oneTimeOnly: z.boolean(),
  enabled: z.boolean(),
});

type CronTaskMetadata = z.infer<typeof cronTaskMetadataSchema>;

type CronTask = CronTaskMetadata & {
  name: string;
  path: string;
  instruction: string;
  loadError?: string;
  cronJob?: CronJob;
};

export type CronTaskListItem = Omit<CronTask, "instruction" | "cronJob"> & {
  nextTriggerTime: string | null;
};

export default class JarvisCron {
  private readonly jarvis: Jarvis;
  private cronTasks: CronTask[] = [];
  private readonly runningTasks = new Set<string>();

  constructor(jarvis: Jarvis) {
    this.jarvis = jarvis;
  }

  init() {
    fs.ensureDirSync(DIR_CRON_TASKS);
    this.loadCronTasks();
    this.resetCronJobs();
    this.watchChanges();
  }

  listCronTasks(): CronTaskListItem[] {
    this.loadCronTasks();
    this.resetCronJobs();
    return this.cronTasks.map((task) => ({
      name: task.name,
      path: task.path,
      description: task.description,
      cronPattern: task.cronPattern,
      oneTimeOnly: task.oneTimeOnly,
      enabled: task.enabled,
      loadError: task.loadError,
      nextTriggerTime: task.loadError
        ? null
        : getNextTriggerTime(task.cronPattern),
    }));
  }

  private watchChanges() {
    const reloadCron = debounce(() => {
      this.loadCronTasks();
      this.resetCronJobs();
    }, 100);

    fs.ensureDirSync(DIR_CRON_TASKS);
    chokidar
      .watch(join(DIR_CRON_TASKS, "*.md"), { ignoreInitial: true })
      .on("all", reloadCron);
  }

  private loadCronTasks() {
    this.stopAllCronJobs();

    if (!fs.existsSync(DIR_CRON_TASKS)) {
      this.cronTasks = [];
      return;
    }

    const cronTasks: CronTask[] = [];
    for (const fileName of fs.readdirSync(DIR_CRON_TASKS)) {
      if (!fileName.endsWith(".md") || fileName.startsWith(".")) {
        continue;
      }

      const taskPath = join(DIR_CRON_TASKS, fileName);
      if (!fs.statSync(taskPath).isFile()) {
        continue;
      }

      const name = fileName.replace(/\.md$/, "");
      const displayPath = toDisplayPath(taskPath);

      try {
        const raw = fs.readFileSync(taskPath, "utf-8");
        const { attributes, body } = fm<Record<string, unknown>>(raw);
        const metadata = cronTaskMetadataSchema.parse(attributes);
        cronTasks.push({
          name,
          path: displayPath,
          ...metadata,
          instruction: body.trim(),
        });
      } catch (error) {
        cronTasks.push({
          name,
          path: displayPath,
          description: "Load failed: invalid task file",
          cronPattern: "0 0 1 1 *",
          oneTimeOnly: false,
          enabled: false,
          instruction: "",
          loadError:
            error instanceof Error ? error.message : "Invalid cron task file",
        });
      }
    }

    this.cronTasks = cronTasks.sort((a, b) => a.name.localeCompare(b.name));
  }

  private resetCronJobs() {
    this.stopAllCronJobs();

    for (const task of this.cronTasks) {
      if (task.loadError) {
        continue;
      }

      try {
        task.cronJob = new CronJob(task.cronPattern, () => {
          void this.triggerTask(task.name);
        });
      } catch (error) {
        task.loadError =
          error instanceof Error ? error.message : "Invalid cron pattern";
        task.enabled = false;
        continue;
      }

      if (task.enabled) {
        task.cronJob.start();
      }
    }
  }

  private async triggerTask(taskName: string) {
    const task = this.cronTasks.find((item) => item.name === taskName);
    if (!task || task.loadError || !task.enabled) {
      return;
    }

    if (this.runningTasks.has(taskName)) {
      console.warn(`Cron task ${taskName} is already running, skipping`);
      return;
    }

    this.runningTasks.add(taskName);

    const instruction = `[Scheduled cron task: ${task.name}]
${task.description}

---

${task.instruction}`;

    const session = this.jarvis.session.createSession(task.name, {
      type: "subagent-cron",
    });

    try {
      const result = await this.jarvis.runner.run(instruction, session.id);
      if (!result.success) {
        const error = result.error ?? "Unknown error";
        console.warn(`Cron task ${taskName} failed: ${error}`);
        this.notifyTaskFailure(taskName, error);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`Cron task ${taskName} error:`, error);
      this.notifyTaskFailure(taskName, message);
    } finally {
      this.runningTasks.delete(taskName);
      this.jarvis.session.deleteSession(session.id);
    }

    if (task.oneTimeOnly) {
      this.disableTask(taskName);
      this.loadCronTasks();
      this.resetCronJobs();
    }
  }

  private notifyTaskFailure(taskName: string, error: string) {
    const message = error.trim() || "Unknown error";
    const maxErrorLength = 1800;
    const body =
      message.length > maxErrorLength
        ? `${message.slice(0, maxErrorLength)}…`
        : message;

    this.jarvis.notification.createNotification({
      source: `cron:${taskName}`,
      content: body,
    });
  }

  private disableTask(taskName: string) {
    const taskPath = join(DIR_CRON_TASKS, `${taskName}.md`);
    if (!fs.existsSync(taskPath)) {
      return;
    }

    try {
      const raw = fs.readFileSync(taskPath, "utf-8");
      const { attributes, body } = fm<Record<string, unknown>>(raw);
      const metadata = cronTaskMetadataSchema.parse(attributes);
      metadata.enabled = false;
      fs.writeFileSync(taskPath, stringifyFrontmatterMd(metadata, body.trim()));
    } catch (error) {
      console.warn(`Failed to disable one-time cron task ${taskName}:`, error);
    }
  }

  private stopAllCronJobs() {
    for (const task of this.cronTasks) {
      task.cronJob?.stop();
      task.cronJob = undefined;
    }
  }
}

function getNextTriggerTime(cronPattern: string): string | null {
  try {
    const cronJob = new CronJob(cronPattern, () => {});
    return timeFormat(cronJob.nextDate().toJSDate().getTime());
  } catch {
    return null;
  }
}

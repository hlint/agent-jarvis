import { timeFormat } from "@repo/shared/lib/time";
import { CronJob } from "cron";
import { debounce, pick } from "es-toolkit";
import fs from "fs-extra";
import { nanoid } from "nanoid";
import { PATH_CRON_TASKS } from "./defines";
import type Jarvis from "./jarvis";

/** name 为唯一标识，仅允许英文字母、数字及符号 - 和 _ */
type CronTask = {
  name: string;
  description: string;
  cronPattern: string;
  oneTimeTrigger: boolean;
  enabled: boolean;
  cronJob?: CronJob;
};

export default class JarvisCron {
  private jarvis: Jarvis;
  private cronTasks: CronTask[] = [];

  constructor(jarvis: Jarvis) {
    this.jarvis = jarvis;
  }

  init() {
    try {
      const raw = fs.readJSONSync(PATH_CRON_TASKS) as Record<string, unknown>[];
      this.cronTasks = raw.map((t) => ({
        ...pick(t as CronTask, [
          "name",
          "description",
          "cronPattern",
          "oneTimeTrigger",
        ]),
        enabled: (t as CronTask).enabled !== false,
      }));
    } catch (_error) {
      fs.writeJSONSync(PATH_CRON_TASKS, this.cronTasks, { spaces: 2 });
    }
    this.resetCronJobs();
  }

  private resetCronJobs() {
    this.cronTasks.forEach((task) => {
      if (task.cronJob) {
        task.cronJob.stop();
      }
      task.cronJob = new CronJob(task.cronPattern, () => {
        this.jarvis.state.newHistoryEntry({
          id: nanoid(6),
          role: "system-event",
          createdTime: timeFormat(),
          brief: `Cron task ${task.name} triggered`,
          data: {
            taskName: task.name,
            oneTimeTrigger: task.oneTimeTrigger,
            taskDescription: task.description,
            taskCronPattern: task.cronPattern,
          },
        });
        this.jarvis.runner.runNext();
        if (task.oneTimeTrigger) {
          this.removeCronTask(task.name);
        }
      });
      if (task.enabled) {
        task.cronJob.start();
      }
    });
    this.persist();
  }

  listCronTasks() {
    return this.cronTasks.map((task, index) => ({
      index: index + 1,
      ...pick(task, [
        "name",
        "description",
        "cronPattern",
        "oneTimeTrigger",
        "enabled",
      ]),
      nextTriggerTime: getNextTriggerTime(task.cronPattern),
    }));
  }

  createCronTask(
    cronTask: Pick<
      CronTask,
      "name" | "description" | "cronPattern" | "oneTimeTrigger" | "enabled"
    >,
  ) {
    const newTask: CronTask = {
      ...cronTask,
      enabled: cronTask.enabled !== false,
    };
    this.cronTasks.push(newTask);
    this.resetCronJobs();
    return {
      ...pick(newTask, ["name", "enabled"]),
      nextTriggerTime: getNextTriggerTime(newTask.cronPattern),
    };
  }

  updateCronTask(
    name: string,
    partial: Partial<
      Pick<
        CronTask,
        "name" | "description" | "cronPattern" | "oneTimeTrigger" | "enabled"
      >
    >,
  ) {
    const index = this.cronTasks.findIndex((task) => task.name === name);
    if (index === -1) return null;
    const task = this.cronTasks[index];
    const newName = partial.name ?? task.name;
    if (newName !== name && this.cronTasks.some((t) => t.name === newName)) {
      return null; // 新 name 已被占用
    }
    const updated: CronTask = {
      name: newName,
      description: partial.description ?? task.description,
      cronPattern: partial.cronPattern ?? task.cronPattern,
      oneTimeTrigger: partial.oneTimeTrigger ?? task.oneTimeTrigger,
      enabled: partial.enabled !== undefined ? partial.enabled : task.enabled,
    };
    this.cronTasks[index] = updated;
    this.resetCronJobs();
    return {
      ...pick(updated, ["name", "enabled"]),
      nextTriggerTime: getNextTriggerTime(updated.cronPattern),
    };
  }

  removeCronTask(name: string) {
    const index = this.cronTasks.findIndex((task) => task.name === name);
    if (index !== -1) {
      if (this.cronTasks[index].cronJob) {
        this.cronTasks[index].cronJob!.stop();
      }
      this.cronTasks.splice(index, 1);
      this.persist();
    }
  }

  // 持久化（仅写入 name/description/cronPattern/oneTimeTrigger，不写入 cronJob 或旧版 id）
  private persist = debounce(() => {
    fs.writeJSONSync(
      PATH_CRON_TASKS,
      this.cronTasks.map((task) =>
        pick(task, [
          "name",
          "description",
          "cronPattern",
          "oneTimeTrigger",
          "enabled",
        ]),
      ),
      { spaces: 2 },
    );
  }, 1000);
}

function getNextTriggerTime(cronPattern: string) {
  const cronJob = new CronJob(cronPattern, () => {});
  return timeFormat(cronJob.nextDate().toJSDate().getTime());
}

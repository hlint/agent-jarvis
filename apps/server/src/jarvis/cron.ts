import { CronJob } from "cron";
import { omit, pick } from "es-toolkit";
import fs from "fs-extra";
import { nanoid } from "nanoid";
import { PATH_CRON_TASKS } from "./defines";
import type Jarvis from "./jarvis";
import { getTimeString } from "./utils";

type CronTask = {
  id: string;
  name: string;
  description: string;
  cronPattern: string;
  oneTimeTrigger: boolean;
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
      this.cronTasks = fs.readJSONSync(PATH_CRON_TASKS) as CronTask[];
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
        this.jarvis.state.addChatEvent({
          id: nanoid(6),
          role: "cron-task-trigger",
          time: Date.now(),
          taskId: task.id,
          taskName: task.name,
          oneTimeTrigger: task.oneTimeTrigger,
          taskDescription: task.description,
          taskCronPattern: task.cronPattern,
        });
        this.jarvis.runner.runNext();
        if (task.oneTimeTrigger) {
          this.removeCronTask(task.id);
        }
      });
      task.cronJob.start();
    });
  }

  listCronTasks() {
    return this.cronTasks.map((task, index) => ({
      index: index + 1,
      ...pick(task, [
        "id",
        "name",
        "description",
        "cronPattern",
        "oneTimeTrigger",
      ]),
      nextTriggerTime: getNextTriggerTime(task.cronPattern),
    }));
  }

  createCronTask(
    cronTask: Pick<
      CronTask,
      "name" | "description" | "cronPattern" | "oneTimeTrigger"
    >,
  ) {
    const newTask: CronTask = {
      id: nanoid(6),
      ...cronTask,
    };
    this.cronTasks.push(newTask);
    this.resetCronJobs();
    return {
      ...omit(newTask, ["cronJob"]),
      nextTriggerTime: getNextTriggerTime(newTask.cronPattern),
    };
  }

  removeCronTask(id: string) {
    const index = this.cronTasks.findIndex((task) => task.id === id);
    if (index !== -1) {
      if (this.cronTasks[index].cronJob) {
        this.cronTasks[index].cronJob.stop();
      }
      this.cronTasks.splice(index, 1);
    }
  }
}

function getNextTriggerTime(cronPattern: string) {
  const cronJob = new CronJob(cronPattern, () => {});
  return getTimeString(cronJob.nextDate().toJSDate().getTime());
}

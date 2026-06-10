import { join } from "node:path";
import { env } from "bun";

export const IS_DEV = !!env.IS_DEV;
export const DIR_RUNTIME = join(
  process.cwd(),
  IS_DEV ? "../../runtime" : "./runtime",
);
export const DIR_RUNTIME_TEMPLATE = join(process.cwd(), "./runtime-template");
export const PATH_INITIALIZED = join(DIR_RUNTIME, "initialized.json");
export const PATH_CONFIG = IS_DEV
  ? join(process.cwd(), "../../config.json")
  : join(process.cwd(), "config.json");
export const DIR_SESSIONS = join(DIR_RUNTIME, "./sessions");
export const DIR_RECYCLE_BIN = join(DIR_RUNTIME, "recycle-bin");
export const DIR_SKILLS = join(DIR_RUNTIME, "skills");
export const DIR_NOTES = join(DIR_RUNTIME, "notes");
export const DIR_WORKSPACE = join(DIR_RUNTIME, "workspace");
export const PATH_SOUL = join(DIR_RUNTIME, "SOUL.md");
export const DIR_TMP = join(DIR_RUNTIME, "tmp");
export const DIR_CRON_TASKS = join(DIR_RUNTIME, "cron-tasks");
export const PATH_NOTIFICATIONS = join(DIR_RUNTIME, "notifications.json");
export const DIR_JARVIS = join(DIR_RUNTIME, ".jarvis");
export const PATH_PUSH_SUBSCRIPTIONS = join(
  DIR_JARVIS,
  "push-subscriptions.json",
);
export const PATH_VAPID_KEYS = join(DIR_JARVIS, "vapid.json");

import { join } from "node:path";
import { env } from "bun";

export const IS_DEV = !!env.IS_DEV;
export const DIR_RUNTIME = join(
  process.cwd(),
  IS_DEV ? "../../runtime" : "./runtime",
);
export const DIR_RUNTIME_EXAMPLE = join(process.cwd(), "./runtime-example");
export const PATH_INITIALIZED = join(DIR_RUNTIME, "initialized.json");
export const PATH_CHAT_STATE = join(DIR_RUNTIME, "data/chat-state.json");
export const PATH_WEBSITE_URL = join(DIR_RUNTIME, "data/website-url.txt");
export const PATH_CONFIG = IS_DEV
  ? join(process.cwd(), "../../config.ts")
  : join(process.cwd(), "config.ts");
export const PATH_SOUL = join(DIR_RUNTIME, "SOUL.md");
export const DIR_NOTES = join(DIR_RUNTIME, "notes");
export const DIR_CRON_TASKS = join(DIR_RUNTIME, "cron-tasks");
export const DIR_SKILLS = join(DIR_RUNTIME, "skills");
export const DIR_DIARIES = join(DIR_RUNTIME, "diaries");
export const DIR_TMP = join(DIR_RUNTIME, "tmp");

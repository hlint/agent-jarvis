import { join } from "node:path";
import { env } from "bun";

export const IS_DEV = !!env.IS_DEV;
export const DIR_RUNTIME = IS_DEV ? "../../runtime" : "./runtime";
export const DIR_RUNTIME_EXAMPLE = `./runtime-example`;
export const PATH_INITIALIZED = join(DIR_RUNTIME, "initialized.json");
export const PATH_CHAT_STATE = join(DIR_RUNTIME, "data/chat-state.json");
export const DIR_MEMORIES = join(DIR_RUNTIME, "memories");
export const DIR_CRON_TASKS = join(DIR_RUNTIME, "cron-tasks");
export const DIR_SKILLS = join(DIR_RUNTIME, "skills");
export const DIR_DIARIES = join(DIR_RUNTIME, "diaries");

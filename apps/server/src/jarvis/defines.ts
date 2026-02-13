import { join } from "node:path";
import { env } from "bun";

export const IS_DEV = !!env.IS_DEV;
export const DIR_RUNTIME = IS_DEV ? "../../runtime" : "./runtime";
export const DIR_RUNTIME_EXAMPLE = `${DIR_RUNTIME}-example`;
export const PATH_INITIALIZED = join(DIR_RUNTIME, "initialized.json");
export const PATH_CHAT_STATE = join(DIR_RUNTIME, "chat-state.json");
export const PATH_MEMORY = join(DIR_RUNTIME, "memory.md");
export const PATH_CRON_TASKS = join(DIR_RUNTIME, "cron-tasks.json");
export const DIR_SKILLS = join(DIR_RUNTIME, "skills");
export const DIR_TOOLS = join(DIR_RUNTIME, "tools");
export const DIR_WORKSPACE = join(DIR_RUNTIME, "workspace");
export const DIR_DIARIES = join(DIR_RUNTIME, "diaries");

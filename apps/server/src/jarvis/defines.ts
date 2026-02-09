import { join } from "node:path";
import { env } from "bun";

export const IS_DEV = !!env.IS_DEV;
export const DIR_RUNTIME = IS_DEV ? "../../runtime" : "./runtime";
export const PATH_CONFIG = join(DIR_RUNTIME, "config.json");
export const PATH_CHAT_STATE = join(DIR_RUNTIME, "chat-state.json");

import { treaty } from "@elysiajs/eden";
import type { App } from "../../../server/src/index";

// @ts-expect-error Elysia types are duplicated in Bun's store, but runtime API is compatible
export const api = treaty<App>(window.location.origin);

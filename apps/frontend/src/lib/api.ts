import { treaty } from "@elysiajs/eden";
import type { App } from "../../../server/src/index";

const isProduction = import.meta.env.PROD;

// @ts-expect-error Elysia types are duplicated in Bun's store, but runtime API is compatible
export const api = treaty<App>(
  isProduction ? window.location.origin : "http://localhost:4000",
);

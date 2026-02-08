import { cors } from "@elysiajs/cors";
import { example } from "@repo/shared/example";
import { Elysia } from "elysia";
import z from "zod";
import jarvisMiddleware from "./jarvis/middleware";
import { spa } from "./spa";

const isProduction = process.env.NODE_ENV === "production";

const app = new Elysia()
  .use(cors())
  .get("/example", ({ query }) => example(query.name), {
    query: z.object({
      name: z.string().optional(),
    }),
  })
  .use(jarvisMiddleware())
  .use(spa({ dir: "./html" }))
  .listen(isProduction ? 3000 : 4000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;

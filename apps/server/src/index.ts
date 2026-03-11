import { basicAuth } from "@eelkevdbos/elysia-basic-auth";
import { example } from "@repo/shared/example";
import { Elysia } from "elysia";
import z from "zod";
import jarvisMiddleware from "./jarvis/middleware";
import { spa } from "./spa";

const JARVIS_SERVER_PORT = process.env.JARVIS_SERVER_PORT
  ? Number(process.env.JARVIS_SERVER_PORT)
  : 3000;
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

const isProduction = process.env.NODE_ENV === "production";
const password = process.env.PASSWORD || "";

const app = new Elysia()
  .use(
    password
      ? (basicAuth({
          credentials: [{ username: "abc", password }],
          realm: "",
          unauthorizedMessage: "Unauthorized",
          unauthorizedStatus: 401,
        }) as undefined) // fix type error
      : undefined,
  )
  .get("/example", ({ query }) => example(query.name), {
    query: z.object({
      name: z.string().optional(),
    }),
  })
  .use(jarvisMiddleware())
  .use(spa({ dir: "./html" }))
  .listen(isProduction ? JARVIS_SERVER_PORT : 4000);

console.log(
  `Jarvis Server is running at http://${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;

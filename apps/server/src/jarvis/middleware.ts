import { join } from "node:path";
import { Elysia } from "elysia";
import fs from "fs-extra";
import z from "zod";
import { DIR_RUNTIME } from "./defines";
import Jarvis from "./jarvis";

export default function jarvisMiddleware() {
  const jarvis = new Jarvis();
  return (
    new Elysia()
      .get("/jarvis/dialog-state", ({ headers }) => {
        const referer = headers.referer;
        if (referer) {
          jarvis.setWebsiteUrl(referer);
        }
        return jarvis.state.getState();
      })
      // 用于获取本地文件
      .get(
        "/jarvis/file",
        ({ set, query }) => {
          const { path } = query;
          const filePath = path.startsWith("/")
            ? path
            : join(DIR_RUNTIME, path);
          if (!fs.existsSync(filePath)) {
            set.status = 404;
            return "Not Found";
          }
          const file = Bun.file(filePath);
          set.headers["content-type"] = file.type;
          return file;
        },
        { query: z.object({ path: z.string() }) },
      )
      .delete("/jarvis/dialog-history", () => {
        jarvis.newConversation();
        return { success: true };
      })
      .post("/jarvis/upload", async (ctx) => {
        const formData = await ctx.request.formData();
        const uploadedFile = formData.get("file");
        if (!uploadedFile || !(uploadedFile instanceof File)) {
          ctx.set.status = 400;
          return { success: false, error: "No file provided" };
        }
        await jarvis.incomingAttachment(uploadedFile, "web");
        return { success: true };
      })
      .post(
        "/jarvis/user-message",
        ({ body }: { body: { content: string } }) => {
          jarvis.incomingUserMessage(body.content, "web");
          return { success: true };
        },
        { body: z.object({ content: z.string() }) },
      )
      .post("/jarvis/abort-execution", () => {
        jarvis.abortAgentExecution();
        return { success: true };
      })
      .ws("/jarvis/ws", {
        open: (ws) => {
          jarvis.clientManager.saveWsClient({
            id: ws.id,
            type: "websocket",
            pushMessage: (message) => {
              ws.send(message);
            },
          });
        },
        close: (ws) => {
          jarvis.clientManager.removeWsClient(ws.id);
        },
      })
  );
}

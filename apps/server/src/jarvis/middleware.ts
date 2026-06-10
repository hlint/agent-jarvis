import { Elysia } from "elysia";
import fs from "fs-extra";
import mime from "mime-types";
import z from "zod";
import { resolveRuntimePath } from "../lib/runtime-path";
import { writeTextFile } from "../lib/write-text-file";
import Jarvis from ".";
import { VoiceRecognitionUnavailableError } from "./multimodal-subagent";

const pushSubscribeBodySchema = z.object({
  endpoint: z.string().url(),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export default function jarvisMiddleware() {
  const jarvis = new Jarvis();
  return new Elysia()
    .post(
      "/jarvis/subagent",
      async ({ body }) => jarvis.runner.runSubagent(body),
      {
        body: z.object({
          sessionName: z.string().min(1).max(100),
          instruction: z.string().min(1),
          parentSessionId: z.string().optional(),
          sessionDetail: z
            .union([z.literal(0), z.literal(1), z.literal(2)])
            .optional(),
        }),
      },
    )
    .post(
      "/jarvis/user-message",
      ({ body }) => {
        const { content, sessionId, attachments } = body;
        void jarvis.runner.run(content, sessionId, attachments);
        return { success: true };
      },
      {
        body: z.object({
          content: z.string(),
          sessionId: z.string(),
          attachments: z.array(z.string()).optional(),
        }),
      },
    )
    .post(
      "/jarvis/abort",
      ({ body, set }) => {
        const result = jarvis.runner.abort(body.sessionId);
        if (!result.success) {
          set.status = result.code === "not_running" ? 409 : 404;
        }
        return result;
      },
      {
        body: z.object({
          sessionId: z.string(),
        }),
      },
    )
    .get("/jarvis/session-list", () => {
      return jarvis.session.getSessionList();
    })
    .get("/jarvis/notification-list", () => {
      return jarvis.notification.getNotificationList();
    })
    .get("/jarvis/push-vapid-public-key", () => {
      const publicKey = jarvis.push.getPublicKey();
      return { publicKey, supported: !!publicKey };
    })
    .get(
      "/jarvis/push-subscribe-status",
      ({ query }) => ({
        registered: jarvis.push.hasSubscription(query.endpoint),
      }),
      {
        query: z.object({
          endpoint: z.string().url(),
        }),
      },
    )
    .post("/jarvis/push-subscribe", ({ body }) => jarvis.push.subscribe(body), {
      body: pushSubscribeBodySchema,
    })
    .delete(
      "/jarvis/push-subscribe",
      ({ body, set }) => {
        const result = jarvis.push.unsubscribe(body.endpoint);
        if (!result.success) {
          set.status = 404;
        }
        return result;
      },
      {
        body: z.object({
          endpoint: z.string().url(),
        }),
      },
    )
    .get("/jarvis/voice-service", () => {
      return { available: jarvis.config.isVoiceRecognitionAvailable() };
    })
    .get(
      "/jarvis/session",
      ({ query, set }) => {
        const { sessionId } = query;
        const session = jarvis.session.getSession(sessionId);
        if (!session || session.type !== "basic") {
          set.status = 404;
          return null;
        }
        return session;
      },
      {
        query: z.object({
          sessionId: z.string(),
        }),
      },
    )
    .post(
      "/jarvis/session",
      ({ body }) => {
        const { name } = body;
        return jarvis.session.createSession(name);
      },
      {
        body: z.object({
          name: z.string().optional(),
        }),
      },
    )
    .delete(
      "/jarvis/notification",
      ({ body, set }) => {
        const { id } = body;
        const result = jarvis.notification.deleteNotification(id);
        if (!result.success) {
          set.status = 404;
        }
        return result;
      },
      {
        body: z.object({
          id: z.string(),
        }),
      },
    )
    .delete(
      "/jarvis/session",
      ({ body, set }) => {
        const { sessionId } = body;
        const result = jarvis.session.deleteSession(sessionId);
        if (!result.success) {
          set.status = result.code === "session_running" ? 409 : 404;
        }
        return result;
      },
      {
        body: z.object({
          sessionId: z.string(),
        }),
      },
    )
    .delete(
      "/jarvis/messages",
      ({ body, set }) => {
        const { sessionId, messageId } = body;
        const result = jarvis.session.deleteMessagesFrom(sessionId, messageId);
        if (!result.success) {
          set.status =
            result.code === "session_running"
              ? 409
              : result.code === "message_not_found"
                ? 404
                : 404;
        }
        return result;
      },
      {
        body: z.object({
          sessionId: z.string(),
          messageId: z.string(),
        }),
      },
    )
    .get(
      "/jarvis/file",
      ({ set, query }) => {
        const { path: filePath } = query;
        let resolvedPath: string;
        try {
          resolvedPath = resolveRuntimePath(filePath);
        } catch (error) {
          set.status = 400;
          return {
            error: error instanceof Error ? error.message : "Invalid file path",
          };
        }
        if (!fs.existsSync(resolvedPath)) {
          set.status = 404;
          return "Not Found";
        }
        const file = Bun.file(resolvedPath);
        set.headers["content-type"] = resolveContentType(
          resolvedPath,
          file.type,
        );
        set.headers["cache-control"] = "no-store";
        return file;
      },
      { query: z.object({ path: z.string() }) },
    )
    .post(
      "/jarvis/file-write",
      ({ body, set }) => {
        try {
          return writeTextFile(body.path, body.content);
        } catch (error) {
          set.status = 400;
          return {
            success: false,
            error: error instanceof Error ? error.message : "Write failed",
          };
        }
      },
      {
        body: z.object({
          path: z.string(),
          content: z.string(),
        }),
      },
    )
    .post(
      "/jarvis/whiteboard-path",
      ({ body, set }) => {
        const result = jarvis.session.setWhiteboardPath(
          body.sessionId,
          body.path,
        );
        if (!result.success) {
          set.status = 404;
        }
        return result;
      },
      {
        body: z.object({
          sessionId: z.string(),
          path: z.string(),
        }),
      },
    )
    .post("/jarvis/speech-to-text", async (ctx) => {
      const formData = await ctx.request.formData();
      const audio = formData.get("audio");
      if (!audio || !(audio instanceof File)) {
        ctx.set.status = 400;
        return { success: false, error: "No audio provided" };
      }

      try {
        const { text } = await jarvis.multimodalSubagent.transcribe(audio);
        return { text };
      } catch (error) {
        if (error instanceof VoiceRecognitionUnavailableError) {
          ctx.set.status = 503;
        } else {
          ctx.set.status = 500;
        }
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Speech-to-text failed",
        };
      }
    })
    .post(
      "/jarvis/upload",
      async (ctx) => {
        const formData = await ctx.request.formData();
        const uploadedFile = formData.get("file");
        if (!uploadedFile || !(uploadedFile instanceof File)) {
          ctx.set.status = 400;
          return { success: false, error: "No file provided" };
        }
        return jarvis.upload.upload(uploadedFile, ctx.query.sessionId);
      },
      {
        query: z.object({
          sessionId: z.string().optional(),
        }),
      },
    )
    .ws("/jarvis/ws", {
      open: (ws) => {
        jarvis.ws.saveWsClient({
          id: ws.id,
          pushMessage: (message) => {
            ws.send(message);
          },
        });
      },
      close: (ws) => {
        jarvis.ws.removeWsClient(ws.id);
      },
    });
}

function resolveContentType(filePath: string, detectedType: string): string {
  const contentType =
    detectedType || mime.lookup(filePath) || "application/octet-stream";
  if (contentType.includes("charset")) {
    return contentType;
  }
  const baseType = contentType.split(";")[0].trim().toLowerCase();
  if (
    baseType.startsWith("text/") ||
    baseType === "application/json" ||
    baseType === "application/javascript" ||
    baseType === "application/xml" ||
    baseType === "image/svg+xml"
  ) {
    return `${baseType}; charset=utf-8`;
  }
  return contentType;
}

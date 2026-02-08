import { Elysia } from "elysia";
import z from "zod";
import { Jarvis } from "./jarvis";
import { toClientMessage } from "./utils";

export default function jarvisMiddleware() {
  const jarvis = new Jarvis();
  return new Elysia()
    .get("/jarvis/messages", () => {
      return jarvis.messages.map(toClientMessage).filter(Boolean);
    })
    .delete("/jarvis/messages", () => {
      jarvis.clearMessages();
      return { success: true };
    })
    .post(
      "/jarvis/message",
      ({ body }: { body: { content: string } }) => {
        jarvis.input({
          role: "user",
          content: body.content,
        });
      },
      { body: z.object({ content: z.string() }) },
    )
    .ws("/jarvis/ws", {
      open: (ws) => {
        jarvis.clientManager.saveClient({
          id: ws.id,
          type: "websocket",
          pushMessage: (message) => {
            ws.send(message);
          },
        });
      },
      close: (ws) => {
        jarvis.clientManager.removeClient(ws.id);
      },
    });
}

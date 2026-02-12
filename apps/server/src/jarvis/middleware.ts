import { Elysia } from "elysia";
import z from "zod";
import Jarvis from "./jarvis";

export default function jarvisMiddleware() {
  const jarvis = new Jarvis();
  return new Elysia()
    .get("/jarvis/dialog-state", () => {
      return jarvis.state.getState();
    })
    .delete("/jarvis/dialog-history", () => {
      jarvis.clearDialog();
      return { success: true };
    })
    .post(
      "/jarvis/user-message",
      ({ body }: { body: { content: string } }) => {
        jarvis.incomingUserMessage(body.content);
        return { success: true };
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

import { Elysia } from "elysia";
import z from "zod";
import Jarvis from "./jarvis";

export default function jarvisMiddleware() {
  const jarvis = new Jarvis();
  return new Elysia()
    .get("/jarvis/chat-state", () => {
      return jarvis.state.getState();
    })
    .delete("/jarvis/chat-events", () => {
      jarvis.clearChatEvents();
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
    .post(
      "/jarvis/request-confirmations",
      ({ body }: { body: { id: string; decision: "confirm" | "reject" } }) => {
        const handled = jarvis.resolveRequestConfirmation(
          body.id,
          body.decision,
        );
        return handled
          ? { success: true }
          : { success: false, error: "request-confirmation-not-found" };
      },
      {
        body: z.object({
          id: z.string(),
          decision: z.enum(["confirm", "reject"]),
        }),
      },
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

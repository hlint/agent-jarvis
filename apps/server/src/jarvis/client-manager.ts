import type { WebSocketMessageForClient } from "@repo/shared/defines";

// import type { Jarvis } from "./jarvis";

type Client = {
  id: string;
  type: "websocket";
  pushMessage: (message: WebSocketMessageForClient) => void;
};

export default class JarvisClientManager {
  // private jarvis: Jarvis;
  private clients: Map<string, Client> = new Map();

  saveClient(client: Client) {
    this.clients.set(client.id, client);
  }

  removeClient(id: string) {
    this.clients.delete(id);
  }

  pushWebSocketMessage(message: WebSocketMessageForClient) {
    for (const client of this.clients.values()) {
      if (client.type === "websocket") {
        client.pushMessage(message);
      }
    }
  }
}

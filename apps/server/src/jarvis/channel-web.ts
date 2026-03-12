import type { WsMessage } from "@repo/shared/defines/jarvis";

type Client = {
  id: string;
  type: "websocket";
  pushMessage: (message: WsMessage) => void;
};

export default class JarvisChannelWeb {
  private wsClients: Map<string, Client> = new Map();

  saveWsClient(client: Client) {
    this.wsClients.set(client.id, client);
  }

  removeWsClient(id: string) {
    this.wsClients.delete(id);
  }

  pushWebSocketMessage(message: WsMessage) {
    for (const client of this.wsClients.values()) {
      if (client.type === "websocket") {
        client.pushMessage(message);
      }
    }
  }
}

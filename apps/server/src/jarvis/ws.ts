import type { WsMessage } from "@repo/shared/defines/ws";

type WsClient = {
  id: string;
  pushMessage: (message: WsMessage) => void;
};

export default class JarvisWs {
  private wsClients: Map<string, WsClient> = new Map();

  saveWsClient(wsClient: WsClient) {
    this.wsClients.set(wsClient.id, wsClient);
  }

  removeWsClient(wsClientId: string) {
    this.wsClients.delete(wsClientId);
  }

  pushWsMessage(message: WsMessage) {
    for (const client of this.wsClients.values()) {
      client.pushMessage(message);
    }
  }
}

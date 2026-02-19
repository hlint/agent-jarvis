import type { HistoryEntry } from "@repo/shared/agent/defines/history";
import type { WsMessage } from "@repo/shared/defines/jarvis";
import { env } from "bun";
import { Bot } from "grammy";
import type Jarvis from "./jarvis";

type Client = {
  id: string;
  type: "websocket";
  pushMessage: (message: WsMessage) => void;
};

export default class JarvisClientManager {
  private jarvis: Jarvis;
  private wsClients: Map<string, Client> = new Map();
  private telegramBot?: Bot;
  private telegramUserId?: number;
  private telegramChatId?: number;
  private telegramIsBusy: boolean = false;

  constructor(jarvis: Jarvis) {
    this.jarvis = jarvis;
  }

  init() {
    // Setup Telegram Bot
    const { TELEGRAM_BOT_TOKEN, TELEGRAM_USER_ID } = env;
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_USER_ID) {
      const telegramBot = new Bot(TELEGRAM_BOT_TOKEN);
      this.telegramBot = telegramBot;
      this.telegramUserId = Number(TELEGRAM_USER_ID);
      telegramBot.start();
      telegramBot.command("start", (ctx) => {
        if (ctx.from?.id !== this.telegramUserId) {
          return ctx.reply("You are not authorized to use this bot.");
        }
        ctx.reply("Welcome! Jarvis is running now.");
      });
      telegramBot.on("message", (ctx) => {
        if (ctx.from?.id !== this.telegramUserId) {
          telegramBot.api.sendMessage(
            ctx.chat.id,
            "You are not authorized to use this bot.",
          );
          return;
        }
        this.telegramChatId = ctx.chat.id;
        if (ctx.message.text) {
          this.jarvis.incomingUserMessage(ctx.message.text, "telegram");
        } else {
          telegramBot.api.sendMessage(
            ctx.chat.id,
            "Only text messages are supported (For now).",
          );
        }
      });
      // Send a typing action to the Telegram chat every 4 seconds if the agent is busy
      setInterval(() => {
        if (
          this.telegramBot &&
          this.telegramUserId &&
          this.telegramChatId &&
          this.telegramIsBusy
        ) {
          this.telegramBot.api.sendChatAction(this.telegramChatId, "typing");
        }
      }, 4000);
    }
  }

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

  pushTelegramMessage(message: HistoryEntry) {
    try {
      if (this.telegramBot && this.telegramUserId) {
        if (message.role === "user" && message.channel !== "telegram") {
          this.telegramBot.api.sendMessage(
            this.telegramUserId,
            `[Channel: ${message.channel ?? "unknown"}] ${message.content ?? ""}`,
          );
          return;
        }
        if (message.role === "agent-reply") {
          this.telegramBot.api.sendMessage(
            this.telegramUserId,
            message.content ?? "",
            { parse_mode: "Markdown" },
          );
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  notifyAgentBusy(isBusy: boolean) {
    this.telegramIsBusy = isBusy;
  }
}

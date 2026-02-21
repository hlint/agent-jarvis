import { join } from "node:path";
import type { HistoryEntry } from "@repo/shared/agent/defines/history";
import type { WsMessage } from "@repo/shared/defines/jarvis";
import { env } from "bun";
import fs from "fs-extra";
import { Bot, InputFile } from "grammy";
import { DIR_RUNTIME } from "./defines";
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
      telegramBot.on("message", async (ctx) => {
        if (ctx.from?.id !== this.telegramUserId) {
          await telegramBot.api.sendMessage(
            ctx.chat.id,
            "You are not authorized to use this bot.",
          );
          return;
        }
        this.telegramChatId = ctx.chat.id;
        if (ctx.message.text) {
          this.jarvis.incomingUserMessage(ctx.message.text, "telegram");
          return;
        }
        const fileInfo = this.getTelegramFileInfo(ctx);
        if (!fileInfo) {
          await telegramBot.api.sendMessage(
            ctx.chat.id,
            "Only text and file messages are supported.",
          );
          return;
        }
        try {
          const file = await this.downloadTelegramFile(
            TELEGRAM_BOT_TOKEN,
            fileInfo.fileId,
          );
          const webFile = new File([file], fileInfo.filename, {
            type: fileInfo.mimeType,
          });
          await this.jarvis.incomingAttachment(webFile, "telegram");
        } catch (err) {
          console.error("Failed to process Telegram file:", err);
          await telegramBot.api.sendMessage(
            ctx.chat.id,
            "Failed to process the file. Please try again.",
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

  async pushTelegramMessage(message: HistoryEntry) {
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
        if (message.role === "attachment" && message.channel !== "telegram") {
          const path = message.data?.path;
          if (!path) return;
          const resolvedPath = path.startsWith("/")
            ? path
            : join(DIR_RUNTIME, path);
          if (!fs.existsSync(resolvedPath)) return;
          await this.telegramBot.api.sendDocument(
            this.telegramChatId ?? this.telegramUserId,
            new InputFile(resolvedPath, message.data.originalName),
            { caption: `Channel: ${message.channel ?? "unknown"}` },
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

  private getTelegramFileInfo(ctx: {
    message?: {
      document?: { file_id: string; file_name?: string; mime_type?: string };
      photo?: Array<{ file_id: string }>;
      audio?: { file_id: string; file_name?: string; mime_type?: string };
      video?: { file_id: string; file_name?: string; mime_type?: string };
      voice?: { file_id: string; mime_type?: string };
      video_note?: { file_id: string };
    };
  }): { fileId: string; filename: string; mimeType: string } | null {
    const msg = ctx.message;
    if (!msg) return null;
    if (msg.document) {
      return {
        fileId: msg.document.file_id,
        filename: msg.document.file_name ?? "document",
        mimeType: msg.document.mime_type ?? "application/octet-stream",
      };
    }
    if (msg.photo?.length) {
      const largest = msg.photo[msg.photo.length - 1];
      return {
        fileId: largest.file_id,
        filename: "photo.jpg",
        mimeType: "image/jpeg",
      };
    }
    if (msg.audio) {
      return {
        fileId: msg.audio.file_id,
        filename: msg.audio.file_name ?? "audio",
        mimeType: msg.audio.mime_type ?? "audio/mpeg",
      };
    }
    if (msg.video) {
      return {
        fileId: msg.video.file_id,
        filename: msg.video.file_name ?? "video",
        mimeType: msg.video.mime_type ?? "video/mp4",
      };
    }
    if (msg.voice) {
      return {
        fileId: msg.voice.file_id,
        filename: "voice.ogg",
        mimeType: msg.voice.mime_type ?? "audio/ogg",
      };
    }
    if (msg.video_note) {
      return {
        fileId: msg.video_note.file_id,
        filename: "video_note.mp4",
        mimeType: "video/mp4",
      };
    }
    return null;
  }

  private async downloadTelegramFile(
    token: string,
    fileId: string,
  ): Promise<ArrayBuffer> {
    const file = await this.telegramBot!.api.getFile(fileId);
    const url = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download: ${res.status}`);
    return res.arrayBuffer();
  }
}

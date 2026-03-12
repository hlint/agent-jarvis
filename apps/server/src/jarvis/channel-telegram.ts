import { join } from "node:path";
import type { HistoryEntry } from "@repo/shared/agent/defines/history";
import type { AttachmentEntry } from "@repo/shared/defines/jarvis";
import { getAttachmentEntryDisplayText } from "@repo/shared/lib/utils";
import fs from "fs-extra";
import { Bot, InputFile } from "grammy";
import { DIR_RUNTIME, PATH_TELEGRAM_CHAT_ID } from "./defines";
import type Jarvis from "./jarvis";

export default class JarvisChannelTelegram {
  private jarvis: Jarvis;
  private telegramBot?: Bot;
  private telegramUserId = 0;
  private telegramChatId = 0;
  private telegramToken = "";
  private itvTyping?: NodeJS.Timeout;

  constructor(jarvis: Jarvis) {
    this.jarvis = jarvis;
  }

  init() {
    if (fs.existsSync(PATH_TELEGRAM_CHAT_ID)) {
      const telegramChatId = fs.readFileSync(PATH_TELEGRAM_CHAT_ID, "utf-8");
      this.telegramChatId = Number(telegramChatId);
    }
  }

  reload() {
    this.loadConfig();
    this.setup();
  }

  private loadConfig() {
    const telegramConfig = this.jarvis.config.getConfig()?.telegram;
    if (telegramConfig?.token && telegramConfig?.userId) {
      this.telegramUserId = Number(telegramConfig.userId);
      this.telegramToken = telegramConfig.token;
    }
  }

  // Setup Telegram Bot
  private setup() {
    if (this.telegramBot) {
      this.telegramBot.stop();
      this.telegramBot = undefined;
    }
    if (this.telegramToken && this.telegramUserId) {
      const telegramBot = new Bot(this.telegramToken);
      this.telegramBot = telegramBot;
      telegramBot.start();
      telegramBot.command("start", (ctx) => {
        if (ctx.from?.id !== this.telegramUserId) {
          return ctx.reply("You are not authorized to use this bot.");
        }
        ctx.reply(
          `✨ Hi there! Jarvis is ready to serve.

**Ask me anything like:**
- "What is the weather in Tokyo?"
- "Show me the latest news about AI"
- "Summarize the document I sent you"

**Commands:**
- Use "/new" to start a new conversation.
- Use "/abort" to abort the current execution.`,
          { parse_mode: "Markdown" },
        );
      });
      telegramBot.command("new", (ctx) => {
        if (ctx.from?.id !== this.telegramUserId) {
          return ctx.reply("You are not authorized to use this bot.");
        }
        this.jarvis.newConversation();
        return ctx.reply("New conversation started.");
      });
      telegramBot.command("abort", (ctx) => {
        if (ctx.from?.id !== this.telegramUserId) {
          return ctx.reply("You are not authorized to use this bot.");
        }
        this.jarvis.abortAgentExecution();
        return ctx.reply("Aborting command received.");
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
        fs.outputFileSync(PATH_TELEGRAM_CHAT_ID, ctx.chat.id.toString());
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
            this.telegramToken,
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
    }
  }

  async pushTelegramMessage(message: HistoryEntry) {
    try {
      if (this.telegramBot && this.telegramUserId) {
        if (message.role === "user" && message.channel !== "telegram") {
          this.telegramBot.api.sendMessage(
            this.telegramUserId,
            `[${message.channel ?? "unknown"}] ${message.content ?? ""}`,
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
          const entry = message as AttachmentEntry;
          const { data } = message as AttachmentEntry;
          const chatId = this.telegramChatId ?? this.telegramUserId;
          const caption = getAttachmentEntryDisplayText(entry);

          const isImage = (t: string) => t.startsWith("image/");
          const isVideo = (t: string) =>
            t.startsWith("video/") && !t.includes("webm");
          const mediaTypeFromUrl = (url: string) => {
            try {
              const ext = url
                .split(".")
                .pop()
                ?.toLowerCase()
                .replace(/\?.*/, "");
              if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext ?? ""))
                return "image";
              if (["mp4", "mov", "avi", "mpeg"].includes(ext ?? ""))
                return "video";
            } catch {}
            return "document";
          };

          if ("url" in data) {
            const mediaType = mediaTypeFromUrl(data.url);
            if (mediaType === "image") {
              await this.telegramBot.api.sendPhoto(chatId, data.url, {
                caption,
              });
            } else if (mediaType === "video") {
              await this.telegramBot.api.sendVideo(chatId, data.url, {
                caption,
              });
            } else {
              await this.telegramBot.api.sendDocument(chatId, data.url, {
                caption,
              });
            }
          } else if ("filePath" in data) {
            const resolvedPath = data.filePath.startsWith("/")
              ? data.filePath
              : join(DIR_RUNTIME, data.filePath);
            if (!fs.existsSync(resolvedPath)) return;
            const file = new InputFile(resolvedPath, data.originalName);
            if (isImage(data.fileType)) {
              await this.telegramBot.api.sendPhoto(chatId, file, { caption });
            } else if (isVideo(data.fileType)) {
              await this.telegramBot.api.sendVideo(chatId, file, { caption });
            } else {
              await this.telegramBot.api.sendDocument(chatId, file, {
                caption,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
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

  public startTyping() {
    const fnTyping = () => {
      if (
        this.telegramBot &&
        this.telegramUserId &&
        this.telegramChatId &&
        this.jarvis.state.getState().status !== "idle"
      ) {
        this.telegramBot.api.sendChatAction(this.telegramChatId, "typing");
      }
    };
    fnTyping();
    this.itvTyping = setInterval(fnTyping, 4000);
  }

  public stopTyping() {
    clearInterval(this.itvTyping);
    this.itvTyping = undefined;
  }
}

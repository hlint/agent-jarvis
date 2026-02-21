import { join } from "node:path";
import type { HistoryEntry } from "@repo/shared/agent/defines/history";
import type { AttachmentEntry } from "@repo/shared/defines/jarvis";
import { timeFormat } from "@repo/shared/lib/time";
import { shortId } from "@repo/shared/lib/utils";
import callLlm from "@repo/shared/llm";
import { env } from "bun";
import { debounce } from "es-toolkit";
import fs from "fs-extra";
import { nanoid } from "nanoid";
import JarvisClientManager from "./client";
import JarvisCron from "./cron";
import {
  DIR_RUNTIME,
  DIR_RUNTIME_EXAMPLE,
  DIR_TMP,
  PATH_INITIALIZED,
  PATH_WEBSITE_URL,
} from "./defines";
import Runner from "./runner";
import { JarvisStateManager } from "./state";

// If the system is inactive for 20 minutes, it will push a system-inactive event.
const SYSTEM_INACTIVE_INTERVAL = 20 * 60 * 1000;

export default class Jarvis {
  public runner = new Runner(this);
  public clientManager = new JarvisClientManager(this);
  public state = new JarvisStateManager(this);
  public cron = new JarvisCron(this);
  public retryCount = 0;
  public websiteUrl: string = "";
  private pushInactiveEvent = debounce(() => {
    const dialogHistory = this.state.getState().dialogHistory;
    const lastEntry = dialogHistory[dialogHistory.length - 1];
    const secondLastEntry = dialogHistory[dialogHistory.length - 2];

    // 如果最后一条和倒数第二条都是静默状态，说明AI已经认为不需要做任何事了，此时不需要唤醒
    if (
      lastEntry?.role === "agent-thinking" &&
      lastEntry?.action?.type === "silent" &&
      secondLastEntry?.role === "system-event" &&
      secondLastEntry?.data?.type === "system-inactive"
    ) {
      return;
    }

    this.pushHistoryEntry({
      id: nanoid(6),
      role: "system-event",
      createdTime: timeFormat(),
      brief: "System Inactive",
      content: "The system has been inactive for 5 minutes.",
      status: "completed",
      data: {
        type: "system-inactive",
      },
    });
    this.wakeUp();
  }, SYSTEM_INACTIVE_INTERVAL);

  constructor() {
    this.init();
  }

  private init() {
    // 创建运行时目录
    fs.ensureDirSync(DIR_RUNTIME);

    // 初始化
    if (!fs.existsSync(PATH_INITIALIZED)) {
      // 从示例目录复制文件到运行时目录
      fs.copySync(DIR_RUNTIME_EXAMPLE, DIR_RUNTIME);

      // 写入初始化标记文件
      fs.writeJSONSync(PATH_INITIALIZED, {
        initialized: true,
        time: timeFormat(),
      });
    }

    // 读取网站URL
    if (fs.existsSync(PATH_WEBSITE_URL)) {
      const websiteUrl = fs.readFileSync(PATH_WEBSITE_URL, "utf-8");
      this.setWebsiteUrl(websiteUrl);
    }

    this.state.init();
    this.cron.init();
    this.clientManager.init();
  }

  incomingUserMessage(content: string, from: "web" | "telegram") {
    this.pushHistoryEntry({
      id: nanoid(6),
      role: "user",
      createdTime: timeFormat(),
      content: content,
      channel: from,
    });
    this.retryCount = 0;
    this.wakeUp();
  }

  async incomingAttachment(file: File, from: "web" | "telegram") {
    await fs.ensureDir(DIR_TMP);
    const ext = file.name ? (/\.\w+$/.exec(file.name)?.[0] ?? "") : "";
    const filename = `${shortId()}${ext}`;
    const destPath = join(DIR_TMP, filename);
    await Bun.write(destPath, file);
    const attachmentId = shortId();
    this.pushHistoryEntry({
      id: attachmentId,
      role: "attachment",
      from: "user",
      channel: from,
      createdTime: timeFormat(),
      data: {
        originalName: file.name,
        type: file.type,
        size: file.size,
        path: destPath,
      },
    } satisfies AttachmentEntry);
    if (
      env.MM_LLM_MODEL &&
      env.MM_LLM_API_KEY &&
      file.name.startsWith("voice.")
    ) {
      try {
        const { text } = await callLlm({
          model: env.MM_LLM_MODEL,
          apiKey: env.MM_LLM_API_KEY,
          baseURL: env.MM_LLM_BASE_URL,
          dialog: [
            {
              role: "user",
              content: "Transcribe the following audio file",
              filePath: destPath,
            },
          ],
        });
        this.pushHistoryEntry({
          id: shortId(),
          role: "system-event",
          createdTime: timeFormat(),
          brief: "Automatic transcription of audio file from user",
          content: text,
          status: "completed",
          data: {
            type: "automatic-transcription",
            attachmentId,
            filePath: destPath,
          },
        });
      } catch (error) {
        console.error(error);
      }
    }
  }

  wakeUp() {
    this.runner.runNext();
  }

  pushHistoryEntry(historyEntry: HistoryEntry) {
    this.state.getState().dialogHistory.push(historyEntry);
    this.notifyStateChanged();
  }

  notifyStateChanged() {
    this.pushInactiveEvent();
    this.state.pushDiff();
  }

  clearDialog() {
    this.state.setState({
      snapshotId: nanoid(6),
      dialogHistory: [],
    });
    this.notifyStateChanged();
  }

  setWebsiteUrl(websiteUrl: string) {
    try {
      const origin = new URL(websiteUrl).origin;
      this.websiteUrl = origin;
      fs.outputFileSync(PATH_WEBSITE_URL, origin);
    } catch (_error) {}
  }
}

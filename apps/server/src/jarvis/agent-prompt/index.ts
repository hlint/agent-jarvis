import { timeFormat } from "@repo/shared/lib/time";
import { DIR_RUNTIME } from "../defines";
import type Jarvis from "../jarvis";
import { getNotes, getRecentDiaries, getSkills, getSOUL } from "./data-loaders";

const CHROMIUM_CDP_VERSION_URL = "http://localhost:9222/json/version";
const CDP_CHECK_TIMEOUT_MS = 500;

export async function isChromiumRemoteDebuggingAvailable(): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), CDP_CHECK_TIMEOUT_MS);
    const res = await fetch(CHROMIUM_CDP_VERSION_URL, {
      signal: ctrl.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return false;
    const json = (await res.json()) as {
      Browser?: string;
      webSocketDebuggerUrl?: string;
    };
    return Boolean(json.Browser && json.webSocketDebuggerUrl);
  } catch {
    return false;
  }
}

export default async function buildAgentPrompt(
  jarvis: Jarvis,
): Promise<string> {
  // const chromiumWithRemoteDebuggingPortOpened = await isChromiumRemoteDebuggingAvailable();
  return JSON.stringify(
    {
      systemEnvironment: {
        currentTime: timeFormat(),
        chatUiWebsiteUrl: jarvis.websiteUrl || "unknown",
        operationSystem: process.platform,
        defaultCwd: DIR_RUNTIME,
        // chromiumWithRemoteDebuggingPortOpened, // real-time check of port 9222
      },
      MySoul: getSOUL(),
      MyCronTasks: jarvis.cron.listCronTasks(),
      MySkills: getSkills(),
      MyNotes: getNotes(),
      MyRecentDiaries: getRecentDiaries(),
    },
    null,
    2,
  );
}

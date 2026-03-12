import { readFile } from "node:fs/promises";
import chokidar from "chokidar";
import { debounce } from "es-toolkit";
import z from "zod";
import { PATH_CONFIG } from "./defines";
import type Jarvis from "./jarvis";

const configSchema = z.object({
  tavilyApiKey: z.string().optional(),
  pexelsApiKey: z.string().optional(),
  ntfyTopic: z.string().optional(),
  telegram: z
    .object({
      token: z.string(),
      userId: z.string(),
    })
    .optional(),
  providers: z.array(
    z.object({
      model: z.string(),
      apiKey: z.string(),
      baseURL: z.string().optional(),
      providerOptions: z.any().optional(),
      duties: z.array(
        z.enum([
          "CHAT",
          "VOICE_RECOGNITION",
          "IMAGE_RECOGNITION",
          "VIDEO_RECOGNITION",
          "OTHER_RECOGNITION",
          "VOICE_GENERATION",
          "IMAGE_GENERATION",
          "VIDEO_GENERATION",
        ]),
      ),
    }),
  ),
});

type Config = z.infer<typeof configSchema>;
type ProviderDuties = Config["providers"][number]["duties"][number];

export default class JarvisConfig {
  private jarvis: Jarvis;
  private config: Config = {
    providers: [],
  };

  constructor(jarvis: Jarvis) {
    this.jarvis = jarvis;
  }

  init() {
    this.load();
    this.watchChanges();
  }

  getConfig() {
    return this.config;
  }

  getAiProvider(dutyName: ProviderDuties) {
    return this.config.providers.find((t) => t.duties?.includes(dutyName));
  }

  private async load() {
    let raw: string;
    try {
      raw = await readFile(PATH_CONFIG, "utf-8");
    } catch (e) {
      console.error(`Failed to read config: ${PATH_CONFIG}`, e);
      return;
    }

    let config: unknown;
    try {
      config = JSON.parse(raw);
    } catch (e) {
      console.error(`Invalid JSON in config: ${PATH_CONFIG}`, e);
      return;
    }
    const result = configSchema.safeParse(config);
    if (!result.success) {
      console.error(result.error.message);
      return;
    }
    this.config = result.data;
    this.jarvis.channelTelegram.reload();
  }

  private watchChanges() {
    const reloadConfig = debounce(() => {
      this.load();
    }, 100);
    chokidar
      .watch(PATH_CONFIG, { ignoreInitial: true })
      .on("all", reloadConfig);
  }
}

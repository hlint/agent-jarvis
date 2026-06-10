import { readFile } from "node:fs/promises";
import chokidar from "chokidar";
import { debounce } from "es-toolkit";
import z from "zod";
import { PATH_CONFIG } from "./defines";

const configSchema = z.object({
  providers: z.array(
    z.object({
      model: z.string(),
      apiKey: z.string(),
      baseURL: z.string().optional(),
      duties: z.array(
        z.enum([
          "CHAT",
          "VOICE_RECOGNITION",
          "IMAGE_RECOGNITION",
          "VIDEO_RECOGNITION",
          "OTHER_RECOGNITION",
          "IMAGE_GENERATION",
        ]),
      ),
    }),
  ),
  providerOptions: z.record(z.string(), z.any()).optional(),
  tavilyApiKey: z.string().optional(),
});

type Config = z.infer<typeof configSchema>;
type ProviderDuties = Config["providers"][number]["duties"][number];

export default class JarvisConfig {
  private config: Config = {
    providers: [],
  };

  init() {
    this.load();
    this.watchChanges();
  }

  isWithComputer() {
    return process.env.JARVIS_WITH_COMPUTER === "true";
  }

  getConfig() {
    return this.config;
  }

  getAiProvider(dutyName: ProviderDuties) {
    return this.config.providers.find((t) => t.duties?.includes(dutyName));
  }

  isVoiceRecognitionAvailable() {
    return !!this.getAiProvider("VOICE_RECOGNITION");
  }

  getProviderOptions() {
    return this.config.providerOptions;
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

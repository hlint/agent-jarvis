import {
  type AgentConfig,
  AgentConfigSchema,
} from "@repo/shared/defines/miscs";
import fs from "fs-extra";
import { PATH_CONFIG } from "./defines";

export default class JarvisConfigManager {
  private config: AgentConfig = {
    gemini_model: "",
    gemini_api_key: "",
  };

  reloadConfig() {
    try {
      const config = AgentConfigSchema.parse(fs.readJSONSync(PATH_CONFIG));
      this.config = config;
    } catch (_error) {
      fs.writeJSONSync(PATH_CONFIG, this.config, { spaces: 2 });
    }
  }

  getConfig() {
    return this.config;
  }
}

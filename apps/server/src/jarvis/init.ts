import type { ChatState } from "@repo/shared/defines/miscs";
import fs from "fs-extra";
import { DIR_RUNTIME, PATH_CHAT_STATE } from "./defines";
import type Jarvis from "./jarvis";

export default function init(jarvis: Jarvis) {
  // 创建运行时目录
  fs.ensureDirSync(DIR_RUNTIME);

  // 加载配置
  jarvis.configManager.reloadConfig();

  // 加载Chat Events
  try {
    const chatEvents = fs.readJSONSync(PATH_CHAT_STATE) as ChatState;
    jarvis.state.setState(chatEvents);
  } catch (_error) {
    fs.writeJSONSync(PATH_CHAT_STATE, jarvis.state.getState(), { spaces: 2 });
  }
}

import fs from "fs-extra";
import { DIR_RUNTIME, PATH_MESSAGES } from "./defines";
import type { Jarvis } from "./jarvis";

export default function init(jarvis: Jarvis) {
  // 创建运行时目录
  fs.ensureDirSync(DIR_RUNTIME);

  // 加载配置
  jarvis.reloadConfig();

  // 加载消息
  try {
    const messages = fs.readJSONSync(PATH_MESSAGES);
    jarvis.messages = messages;
  } catch (_error) {
    fs.writeJSONSync(PATH_MESSAGES, jarvis.messages, { spaces: 2 });
  }
}

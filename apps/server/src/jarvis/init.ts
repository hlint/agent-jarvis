import fs from "fs-extra";
import { DIR_RUNTIME, PATH_MEMORY } from "./defines";
import type Jarvis from "./jarvis";

export default function init(jarvis: Jarvis) {
  // 创建运行时目录
  fs.ensureDirSync(DIR_RUNTIME);

  // 加载Chat Events
  jarvis.state.init();

  // 创建长期记忆文件
  fs.ensureFileSync(PATH_MEMORY);

  // 加载定时任务
  jarvis.cron.init();
}

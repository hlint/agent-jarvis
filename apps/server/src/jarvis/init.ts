import { timeFormat } from "@repo/shared/lib/time";
import fs from "fs-extra";
import { DIR_RUNTIME, DIR_RUNTIME_EXAMPLE, PATH_INITIALIZED } from "./defines";
import type Jarvis from "./jarvis";

export default function init(jarvis: Jarvis) {
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

  jarvis.state.init();
  jarvis.cron.init();
}

import fs from "fs-extra";
import {
  DIR_RUNTIME,
  DIR_RUNTIME_EXAMPLE,
  DIR_WORKSPACE,
  PATH_INITIALIZED,
} from "./defines";
import type Jarvis from "./jarvis";
import { getTimeString } from "./utils";

export default function init(jarvis: Jarvis) {
  // 创建运行时目录
  fs.ensureDirSync(DIR_RUNTIME);
  fs.ensureDirSync(DIR_WORKSPACE);

  // 初始化
  if (!fs.existsSync(PATH_INITIALIZED)) {
    // 从示例目录复制文件到运行时目录
    fs.copySync(DIR_RUNTIME_EXAMPLE, DIR_RUNTIME);

    // 写入初始化标记文件
    fs.writeJSONSync(PATH_INITIALIZED, {
      initialized: true,
      time: getTimeString(),
    });
  }

  jarvis.state.init();
  jarvis.cron.init();
}

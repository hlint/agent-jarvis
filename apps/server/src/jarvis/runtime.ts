import { timeFormat } from "@repo/shared/lib/time";
import fs from "fs-extra";
import { DIR_RUNTIME, DIR_RUNTIME_TEMPLATE, PATH_INITIALIZED } from "./defines";

export default class JarvisRuntime {
  init() {
    // Initialize if needed
    if (!fs.existsSync(PATH_INITIALIZED)) {
      // Create runtime directory
      fs.ensureDirSync(DIR_RUNTIME);
      // Copy files from example directory to runtime directory
      fs.copySync(DIR_RUNTIME_TEMPLATE, DIR_RUNTIME);
      // Write initialization marker file
      fs.writeJSONSync(PATH_INITIALIZED, {
        initialized: true,
        time: timeFormat(),
      });
    }
  }
}

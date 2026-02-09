import fs from "fs-extra";
import { PATH_MEMORY } from "./defines";

export default class JarvisMemory {
  getLongTermMemory() {
    return fs.readFileSync(PATH_MEMORY, "utf8");
  }
}

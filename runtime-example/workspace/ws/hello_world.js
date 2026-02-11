// 示例脚本：演示如何读取环境变量和命令行参数
import { getArgs, getFlagValue, hasFlag } from "./utils/args.js";
import { getEnv } from "./utils/env.js";

// 读取环境变量
const apiKey = getEnv("HELLO_WORLD_API_KEY");
console.log(`API Key: ${apiKey ?? "(not set)"}`);

// 读取命令行参数
const args = getArgs();
console.log(`Arguments: ${args.length > 0 ? args.join(", ") : "(none)"}`);

// 示例：根据参数执行不同逻辑
if (hasFlag("--greet")) {
  const name = getFlagValue("--greet");
  console.log(`Hello, ${name ?? "World"}!`);
}

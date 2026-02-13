// 示例脚本：演示如何读取环境变量和运行参数
import getRuntimeEnv from "@ws/system/env";
import getRuntimeParams from "@ws/system/params";

// 读取环境变量
const apiKey = getRuntimeEnv("HELLO_WORLD_API_KEY");
console.log(`API Key: ${apiKey ?? "(not set)"}`);

// 读取运行参数
const params = getRuntimeParams();
console.log(`Params: ${JSON.stringify(params)}`);

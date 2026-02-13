/**
 * 命令行参数工具函数
 * 该文件受保护，永远不要修改或删除它
 */

/**
 * 获取命令行参数（排除 bun 和脚本路径）
 * @returns {string[]} 命令行参数数组
 */
function getArgs() {
  return process.argv.slice(2);
}

/**
 * 获取某个标志后面的值
 * @param {string} flag - 标志名（如 '--name'）
 * @returns {string | undefined} 标志对应的值
 */
function getFlagValue(flag) {
  const args = getArgs();
  const index = args.indexOf(flag);
  return index >= 0 && index + 1 < args.length ? args[index + 1] : undefined;
}

/**
 * 读取命令行参数
 * @returns {Record<string, any>} 命令行参数对象
 */
export default function getRuntimeParams() {
  return JSON.parse(getFlagValue("--params") ?? "{}");
}

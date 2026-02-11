/**
 * 命令行参数工具函数
 */

/**
 * 获取命令行参数（排除 bun 和脚本路径）
 * @returns {string[]} 命令行参数数组
 */
export function getArgs() {
  return process.argv.slice(2);
}

/**
 * 检查是否包含某个参数
 * @param {string} flag - 要检查的参数
 * @returns {boolean}
 */
export function hasFlag(flag) {
  return getArgs().includes(flag);
}

/**
 * 获取某个标志后面的值
 * @param {string} flag - 标志名（如 '--name'）
 * @returns {string | undefined} 标志对应的值
 */
export function getFlagValue(flag) {
  const args = getArgs();
  const index = args.indexOf(flag);
  return index >= 0 && index + 1 < args.length ? args[index + 1] : undefined;
}

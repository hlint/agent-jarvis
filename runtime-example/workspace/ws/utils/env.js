/**
 * 环境变量工具函数
 */

/**
 * 获取环境变量的值
 * @param {string} key - 环境变量名
 * @returns {string | undefined} 环境变量的值
 */
export function getEnv(key) {
  return process.env[key];
}

/**
 * 检查环境变量是否存在
 * @param {string} key - 环境变量名
 * @returns {boolean}
 */
export function hasEnv(key) {
  return (
    key in process.env &&
    process.env[key] !== undefined &&
    process.env[key] !== ""
  );
}

/**
 * 获取环境变量的值，若不存在则抛出错误
 * @param {string} key - 环境变量名
 * @returns {string} 环境变量的值
 * @throws {Error} 当环境变量不存在时
 */
export function requireEnv(key) {
  if (!hasEnv(key)) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return process.env[key];
}

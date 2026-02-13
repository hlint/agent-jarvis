/**
 * 环境变量工具函数
 * 该文件受保护，永远不要修改或删除它
 */

/**
 * 获取环境变量的值
 * @param {string} key - 环境变量名
 * @returns {string | undefined} 环境变量的值
 */
export default function getRuntimeEnv(key) {
  return process.env[key];
}

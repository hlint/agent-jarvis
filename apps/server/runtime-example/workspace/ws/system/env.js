/**
 * 获取环境变量的值
 * @param {string} key - 环境变量名
 * @returns {string | undefined} 环境变量的值
 */
export default function getRuntimeEnv(key) {
  return process.env[key];
}

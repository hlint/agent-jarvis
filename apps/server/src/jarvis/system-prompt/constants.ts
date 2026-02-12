export const DELIM = "════════════════════════════════════════";

/** 生成统一的小节标题 */
export function section(title: string, content: string): string {
  return `${DELIM}\n■ ${title}\n${DELIM}\n\n${content.trim()}\n`;
}

import dayjs from "dayjs";

export function contentBuilder({
  text,
  systemEventLabel,
  time,
}: {
  text: string;
  systemEventLabel?: string;
  time?: number;
}) {
  let content = "";
  if (time) {
    content += `[Time: ${getTimeString(time)}]\n`;
  }
  if (systemEventLabel) {
    content += `[System Event: ${systemEventLabel}]\n`;
  }
  content += text;
  return content;
}

export function getTimeString(time?: number) {
  return dayjs(time).format("dddd, MMMM D, YYYY HH:mm A");
}

/** 移除 AI 误仿造的系统格式前缀，避免 [Time:...] [System Event:...] 污染回复 */
export function stripSystemFormatPrefixes(text: string) {
  const strippedText = text
    .replace(/^(\s*\[(?:Time|System Event):[^\]]*\]\s*)+/g, "")
    .trimStart();
  return {
    strippedText,
    removedPrefixCount: text.length - strippedText.length,
  };
}

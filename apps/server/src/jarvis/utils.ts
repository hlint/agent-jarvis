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
    content += `[Time: ${dayjs(time).format("YYYY-MM-DDTHH:mm:ssZ[Z]")}]\n`;
  }
  if (systemEventLabel) {
    content += `[System Event: ${systemEventLabel}]\n`;
  }
  content += text;
  return content;
}

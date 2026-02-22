import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

// 格式化时间字符串，类似："Sunday, February 8, 2026 17:06"
export function timeFormat(time?: number): string {
  return dayjs(time).format("dddd, MMMM D, YYYY HH:mm");
}

// 返回某一时间距离当前时间的差值，类似："1 hour ago"
export function timeToNow(time?: number): string {
  return dayjs(time).toNow(true);
}

// 智能时间显示
export function smartTimeFormat(time?: number | string) {
  const date = dayjs(time);
  const now = dayjs();
  if (date.isSame(now, "day")) {
    return date.format("HH:mm");
  }
  if (date.isSame(now, "month")) {
    return date.format("MM-DD");
  }
  return date.format("YYYY-MM-DD");
}

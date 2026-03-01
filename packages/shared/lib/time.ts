import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

// Format time string, e.g. "Sunday, February 8, 2026 17:06"
export function timeFormat(time?: number): string {
  return dayjs(time).format("dddd, MMMM D, YYYY HH:mm");
}

// Return relative time to now, e.g. "1 hour ago"
export function timeToNow(time?: number): string {
  return dayjs(time).toNow(true);
}

// Smart time display
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

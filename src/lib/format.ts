import { DISPLAY_TIMEZONE } from "./constants";

export function formatDateTime(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: DISPLAY_TIMEZONE,
    month: "short", day: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(date);
}

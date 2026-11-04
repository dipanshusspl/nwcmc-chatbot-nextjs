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

export function cleanUrlText(text: string): string {
  return text
    .replace(/https?\s*:\s*\/\s*\/\s*/gi, (match) => match.replace(/\s+/g, ""))
    .replace(/(https?:\/\/[^\s<>"']+)\s+([/?#&=])\s*/gi, "$1$2")
    .replace(/(https?:\/\/[^\s<>"']*)(?:\s+\.\s*|\.\s+)(?=[a-z\d])/g, "$1.");
}

export function formatChatbotResponse(text: string): string {
  return cleanUrlText(text).trim();
}
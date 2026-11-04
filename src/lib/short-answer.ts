import { cleanUrlText } from "./format";

/** Plain text and a hard 250 UTF-16-unit ceiling (also <=250 Unicode code points).
 * Preserve grapheme clusters, including Marathi combining marks and joined emoji.
 */
export const WHATSAPP_MAX_CHARACTERS = 250;

export interface QueryAnswer {
  url?: string;
  answer: string;
}

export function plainText(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1 ($2)")
    .replace(/<[^>]*>/g, "")
    .replace(/^[ \t]*#{1,6}\s+/gm, "")
    .replace(/^[ \t]*[-*+]\s+/gm, "")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function limitShortAnswer(text: string, max = WHATSAPP_MAX_CHARACTERS): string {
  const clean = plainText(text);
  if (clean.length <= max) return clean;
  if (max <= 0) return "";
  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  let result = "";
  for (const { segment } of segmenter.segment(clean)) {
    if (result.length + segment.length > max - 1) break;
    result += segment;
  }
  // Prefer a whole word if that doesn't throw away too much useful text.
  const space = result.lastIndexOf(" ");
  if (space >= result.length * 0.7) result = result.slice(0, space);
  return result.trimEnd() + "…";
}

export function splitQueryAnswer(text: string): QueryAnswer {
  let url: string | undefined;
  const normalized = cleanUrlText(
    text
      .replace(/<think>[\s\S]*?<\/think>/gi, "")
      .replace(/<a\b[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, "$2 $1")
      .replace(/!?\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g, "$1 $2")
      .replace(/&amp;/gi, "&")
      .replace(/<(?=https?:\/\/)([^>]+)>/g, "$1"),
  );

  const withoutLinks = normalized
    .replace(/https?:\/\/[^\s<>"']+/gi, (match) => {
      let candidate = match.replace(/[.,;:!?\]}]+$/g, "");
      while (
        candidate.endsWith(")") &&
        (candidate.match(/\)/g)?.length || 0) > (candidate.match(/\(/g)?.length || 0)
      ) {
        candidate = candidate.slice(0, -1);
      }
      try {
        const parsed = new URL(candidate);
        if (!url && candidate.length <= WHATSAPP_MAX_CHARACTERS && parsed.hostname) url = candidate;
      } catch {
        // Ignore malformed URLs rather than returning them as links.
      }
      return "";
    })
    .replace(/\(\s*\)/g, "");

  const answer = limitShortAnswer(withoutLinks);
  return url ? { url, answer } : { answer };
}

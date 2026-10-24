import crypto from "node:crypto";
import * as cheerio from "cheerio";
import { extractText, getDocumentProxy } from "unpdf";
import { db, type SavedUrlRow } from "./db";
import { MAX_EXTRACTED_TEXT, MAX_WEBSITE_TEXT } from "./constants";
import { isSafePublicUrlResolved } from "./security";

export function chunkText(text: string, chunkSize = 800, overlap = 200): string[] {
  const step = Math.max(chunkSize - overlap, 1);
  const out: string[] = [];
  for (let i = 0; i < text.length; i += step) out.push(text.slice(i, i + chunkSize));
  return out;
}

export async function extractPdfText(data: Uint8Array): Promise<string> {
  const pdf = await getDocumentProxy(data);
  const { text } = await extractText(pdf, { mergePages: true });
  return (Array.isArray(text) ? text.join("\n") : text).slice(0, MAX_EXTRACTED_TEXT);
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0 Safari/537.36";

/** Fetch a page (SSRF-hardened, redirects re-validated) and return its visible text. */
export async function extractWebsiteContent(url: string): Promise<string> {
  try {
    let current = url;
    let res: Response | null = null;
    for (let hop = 0; hop <= 3; hop++) {
      if (!(await isSafePublicUrlResolved(current))) {
        console.warn("[extractWebsiteContent] rejected unsafe URL", current);
        return "";
      }
      res = await fetch(current, {
        headers: { "User-Agent": UA },
        redirect: "manual",
        signal: AbortSignal.timeout(15_000),
      });
      if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
        current = new URL(res.headers.get("location")!, current).toString();
        await res.body?.cancel();
        res = null;
        continue;
      }
      break;
    }
    if (!res || !res.ok) return "";

    const ct = (res.headers.get("content-type") || "").toLowerCase();
    if (!ct.includes("text/html") && !ct.includes("text/plain")) return "";

    const limit = MAX_WEBSITE_TEXT * 4;
    const chunks: Uint8Array[] = [];
    let total = 0;
    const reader = res.body?.getReader();
    if (!reader) return "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done || !value) break;
      total += value.byteLength;
      if (total > limit) {
        await reader.cancel();
        break;
      }
      chunks.push(value);
    }
    const bytes = Buffer.concat(chunks);
    const charset = /charset=([\w-]+)/.exec(ct)?.[1] || "utf-8";
    let html: string;
    try {
      html = new TextDecoder(charset).decode(bytes);
    } catch {
      html = new TextDecoder("utf-8").decode(bytes);
    }

    const $ = cheerio.load(html);
    $("script, style, noscript, svg, iframe, footer, header, nav, form").remove();
    const root = $("main").first().length
      ? $("main").first()
      : $("article").first().length
        ? $("article").first()
        : $("body").first().length
          ? $("body").first()
          : $.root();

    // Join every text node with a space (same as BeautifulSoup get_text(separator=' '))
    const parts: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const walk = (nodes: any[]) => {
      for (const n of nodes) {
        if (n.type === "text") parts.push(n.data);
        else if (n.children) walk(n.children);
      }
    };
    walk((root as unknown as { toArray(): unknown[] }).toArray());
    return parts.join(" ").split(/\s+/).filter(Boolean).join(" ").slice(0, MAX_WEBSITE_TEXT);
  } catch (err) {
    console.warn("[extractWebsiteContent] failed", err);
    return "";
  }
}

/** Fetch the URL, re-chunk it and store the chunks. Returns false if nothing could be extracted. */
export async function syncSavedUrl(row: SavedUrlRow, forceRechunk = false): Promise<boolean> {
  const sql = db();
  const raw = await extractWebsiteContent(row.url);
  if (!raw.trim()) return false;

  const hash = crypto.createHash("sha256").update(raw, "utf8").digest("hex");
  if (row.content_hash === hash && !forceRechunk) {
    await sql`update chatbot_url set last_synced_at = now() where id = ${row.id}`;
    return true;
  }

  const rows = chunkText(raw)
    .map((c) => c.trim())
    .filter((c) => c.length >= 20)
    .map((content) => ({ url_source_id: row.id, content }));

  await sql.begin(async (tx) => {
    await tx`delete from chatbot_urlchunk_tbl where url_source_id = ${row.id}`;
    if (rows.length) await tx`insert into chatbot_urlchunk_tbl ${tx(rows, "url_source_id", "content")}`;
    await tx`update chatbot_url set content_hash = ${hash}, last_synced_at = now() where id = ${row.id}`;
  });
  return true;
}

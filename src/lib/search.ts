import { db, type FaqRow } from "./db";
import { STOP_WORDS } from "./constants";
import { sequenceRatio } from "./similarity";

const WORD_RE = /[\p{L}\p{M}\p{N}_]+/gu;

export function queryWords(text: string): string[] {
  return (text.toLowerCase().match(WORD_RE) ?? [])
    .filter((w) => [...w].length >= 2 && !STOP_WORDS.has(w))
    .slice(0, 25);
}

const likeEscape = (s: string) => s.replace(/[\\%_]/g, (c) => "\\" + c);
const contains = (s: string) => `%${likeEscape(s)}%`;

export async function keywordFaqMatch(queryText: string): Promise<FaqRow | null> {
  const sql = db();
  const queryClean = queryText.toLowerCase().trim();
  const words = queryWords(queryClean);
  if (!words.length) return null;

  const exact = await sql<FaqRow[]>`
    select * from chatbot_faq where question ilike ${contains(queryClean.slice(0, 255))}
    order by created_at desc limit 1`;
  if (exact.length) return exact[0];

  const patterns = words.map(contains);
  const candidates = await sql<FaqRow[]>`
    select * from chatbot_faq
    where question ilike any(${patterns}::text[]) or answer ilike any(${patterns}::text[])
    order by created_at desc limit 100`;
  if (!candidates.length) return null;

  let best: FaqRow | null = null;
  let bestScore = 0;
  for (const faq of candidates) {
    const q = faq.question.toLowerCase();
    const ratio = sequenceRatio(queryClean, q);
    const tokens = new Set(q.match(WORD_RE) ?? []);
    const overlap = words.filter((w) => tokens.has(w)).length / words.length;
    const score = ratio * 0.6 + overlap * 0.4;
    if (score > bestScore) { bestScore = score; best = faq; }
  }
  return bestScore >= 0.35 ? best : null;
}

export type Source = "faq" | "url" | "document";

export async function buildContext(userQuery: string, multiFaq: boolean): Promise<{ context: string; source: Source } | null> {
  const sql = db();
  const words = queryWords(userQuery);

  // 1) FAQ
  const [{ n: faqCount }] = await sql<{ n: number }[]>`select count(*)::int as n from chatbot_faq`;
  if (faqCount > 0) {
    if (!multiFaq) {
      const m = await keywordFaqMatch(userQuery);
      if (m) return { source: "faq", context: `FAQ Context:\nQuestion: ${m.question}\nAnswer: ${m.answer}` };
    } else {
      const matched: FaqRow[] = [];
      const kw = await keywordFaqMatch(userQuery);
      if (kw) matched.push(kw);
      const subs = userQuery.split(/\band\b|&|,/i);
      if (subs.length > 1) {
        for (const s of subs) {
          const t = s.trim();
          if (!t) continue;
          const m = await keywordFaqMatch(t);
          if (m && !matched.some((f) => f.id === m.id)) matched.push(m);
        }
      }
      if (matched.length) {
        const texts = matched.map((m, i) => `[FAQ Entry ${i + 1}]\nQuestion: ${m.question}\nAnswer: ${m.answer}`);
        return { source: "faq", context: "FAQ Context:\n" + texts.join("\n\n---\n\n") };
      }
    }
  }

  if (!words.length) return null;
  const patterns = words.map(contains);

  // 2) Latest connected website
  const [site] = await sql<{ id: string; url: string }[]>`select id, url from chatbot_url order by id desc limit 1`;
  if (site) {
    const chunks = await sql<{ content: string }[]>`
      select content from chatbot_urlchunk_tbl
      where url_source_id = ${site.id} and content ilike any(${patterns}::text[])
      order by id limit 6`;
    if (chunks.length) {
      const joined = chunks.map((c, i) => `[Excerpt ${i + 1} from ${site.url}]\n${c.content}`).join("\n\n---\n\n");
      return { source: "url", context: `Website Context:\n${joined}` };
    }
  }

  // 3) Uploaded documents
  const docs = await sql<{ content: string; source: string | null }[]>`
    select content, source from "chatbot_IVC"
    where content ilike any(${patterns}::text[])
    order by id limit 6`;
  if (docs.length) {
    const joined = docs.map((d, i) => `[Excerpt ${i + 1} from ${d.source || "document"}]\n${d.content}`).join("\n\n---\n\n");
    return { source: "document", context: `Document Context (top ${docs.length} matching excerpts):\n${joined}` };
  }
  return null;
}

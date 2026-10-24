import Groq from "groq-sdk";
import { FALLBACK_REPLY } from "./constants";
import { buildContext, type Source } from "./search";
import { db } from "./db";
import { MAX_ADMIN_TEXT_LEN } from "./constants";
import { stripNul } from "./text";

const g = globalThis as unknown as { __groq?: Groq };
export function groq(): Groq {
  if (!g.__groq) {
    if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is not set");
    g.__groq = new Groq({ apiKey: process.env.GROQ_API_KEY, timeout: 25_000, maxRetries: 1 });
  }
  return g.__groq;
}
export const CHAT_MODEL = () => process.env.GROQ_CHAT_MODEL || "openai/gpt-oss-120b";

function systemPrompt(source: Source): string {
  const base =
    "You are a helpful assistant for NWCMC. " +
    "Assume all user questions refer to NWCMC, even if the user does not " +
    "explicitly mention 'NWCMC'.\nReply in the same language the user used to ask.\n";
  if (source === "url") {
    return base +
      "The administrator has connected a website as the knowledge source for this " +
      "question. Answer using ONLY the information in the Facts Context block below.\n" +
      "Write a clear, direct answer — do not mention that the content came from a " +
      "website, and do not dump the raw text.\n" +
      "MULTIPLE QUESTIONS HANDLING:\n" +
      "- If the user asks multiple questions, answer all that are supported by the " +
      "Facts Context. For any sub-question NOT covered, state briefly: " +
      "'I don't have information regarding [missing topic].'\n" +
      "Only if the content contains NOTHING relevant to ANY part of the query, " +
      `respond exactly with: '${FALLBACK_REPLY}'`;
  }
  if (source === "document") {
    return base +
      "Answer the user's question using ONLY the information in the Facts Context " +
      "block below. Write a clear, direct answer grounded in the excerpt. Do not " +
      "invent facts that are not present in the excerpt.\n" +
      "MULTIPLE QUESTIONS HANDLING:\n" +
      "- If the user asks multiple questions in a single prompt, address each one " +
      "using the context. If some are not covered, answer the covered parts and " +
      "politely state that information for the rest is not available.\n" +
      "Only if the excerpt genuinely does NOT address ANY part of the question, " +
      `respond exactly with: '${FALLBACK_REPLY}'`;
  }
  return base +
    "The Facts Context below is an FAQ that the administrator authored as the " +
    "canonical answer. Use the FAQ answer's wording as-is. Only paraphrase lightly " +
    "if the user asked in a different language or the phrasing needs a small " +
    "adaptation to fit the question.\n" +
    "MULTIPLE QUESTIONS HANDLING:\n" +
    "- If the user asks about multiple subjects (e.g., Mayor and Deputy Mayor), " +
    "combine the information from all provided FAQ entries into a clear response.\n" +
    "If NO information in the Facts Context answers ANY part of the question, " +
    `respond exactly with: '${FALLBACK_REPLY}'`;
}

async function generate(userQuery: string, context: string, source: Source): Promise<string> {
  try {
    const model = CHAT_MODEL();
    const completion = await groq().chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt(source) },
        { role: "user", content: `Facts Context:\n${context}\n\nUser Question: ${userQuery}` },
      ],
      temperature: 0,
      max_tokens: 1024,
      // gpt-oss models spend tokens on reasoning; keep it short so the answer isn't cut off
      ...(model.includes("gpt-oss") ? ({ reasoning_effort: "low" } as Record<string, unknown>) : {}),
    });
    return (completion.choices[0]?.message?.content || "").trim();
  } catch (err) {
    console.warn("[chatbot] generation failed", err);
    return "";
  }
}

/** Shared retrieval + generation pipeline for both chat endpoints. */
export async function answerQuery(userQuery: string, multiFaq: boolean): Promise<string> {
  const found = await buildContext(userQuery, multiFaq);
  if (!found) return FALLBACK_REPLY;
  return (await generate(userQuery, found.context, found.source)) || FALLBACK_REPLY;
}

export async function logChat(userQuery: string, responseText: string): Promise<void> {
  try {
    await db()`
      insert into chatbot_chatlog (request_text, response_text)
      values (${stripNul(userQuery).slice(0, MAX_ADMIN_TEXT_LEN)}, ${stripNul(responseText || "").slice(0, MAX_ADMIN_TEXT_LEN)})`;
  } catch (err) {
    console.warn("[chatbot] failed to log chat", err);
  }
}

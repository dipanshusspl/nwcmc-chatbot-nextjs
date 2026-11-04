import { FALLBACK_REPLY } from "./constants";
import { buildContext, type Source } from "./search";
import { db } from "./db";
import { MAX_ADMIN_TEXT_LEN } from "./constants";
import { stripNul } from "./text";
import { completeText } from "./llm";
import { formatChatbotResponse } from "./format";

export { CHAT_MODEL, groq } from "./llm";

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

async function generate(userQuery: string, context: string, source: Source, short: boolean): Promise<string> {
  const shortInstructions = short
    ? "\nAnswer concisely in at most 250 characters. If a relevant official URL is included in the facts, include the complete URL unchanged."
    : "";
  return completeText({
    system: systemPrompt(source) + shortInstructions,
    user: `Facts Context:\n${context}\n\nUser Question: ${userQuery}`,
    maxTokens: short ? 256 : 1024,
  });
}

/** Shared retrieval + generation pipeline for both chat endpoints. */
export async function answerQuery(userQuery: string, multiFaq = true, short = false): Promise<string> {
  const found = await buildContext(userQuery, multiFaq);
  if (!found) return FALLBACK_REPLY;
  const response = (await generate(userQuery, found.context, found.source, short)) || FALLBACK_REPLY;
  return short ? response : formatChatbotResponse(response);
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

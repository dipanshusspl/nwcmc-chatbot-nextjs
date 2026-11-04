import { NextResponse } from "next/server";
import { answerQuery, logChat } from "./answer";
import { MAX_CHAT_QUERY_LEN } from "./constants";
import { isRateLimited } from "./rate-limit";
import { corsHeaders, readBody } from "./security";
import { splitQueryAnswer, limitShortAnswer } from "./short-answer";

type Dependencies = {
  answer: typeof answerQuery;
  log: typeof logChat;
  rateLimited: typeof isRateLimited;
};
const defaults: Dependencies = { answer: answerQuery, log: logChat, rateLimited: isRateLimited };

/** Identical parsing, validation, CORS, retrieval, rate limiting and logging. */
export function createChatHandler(short: boolean, deps: Dependencies = defaults) {
  const json = (req: Request, payload: object, status = 200) => NextResponse.json(
    payload,
    { status, headers: { ...corsHeaders(req), "Cache-Control": "no-store", ...(status === 405 ? { Allow: "POST, OPTIONS" } : {}) } },
  );
  const message = (req: Request, text: string, status = 200) => json(
    req,
    short ? { answer: limitShortAnswer(text) } : { response: text },
    status,
  );
  return {
    async OPTIONS(req: Request) {
      return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
    },
    async GET(req: Request) { return message(req, "Method not allowed.", 405); },
    async POST(req: Request) {
      try {
        // One shared bucket prevents bypassing the limit by alternating routes.
        if (await deps.rateLimited(req.headers, "chat_api")) {
          return message(req, "Too many requests. Please slow down.", 429);
        }
        const body = await readBody(req);
        if (body === null) return message(req, "Request body too large.", 413);
        const raw = body.query || body.message || body.Body || "";
        const query = typeof raw === "string" ? raw.trim().slice(0, MAX_CHAT_QUERY_LEN) : "";
        if (!query) return message(req, "Please enter a valid question.", 400);
        const generated = await deps.answer(query, true, short);
        if (short) {
          const payload = splitQueryAnswer(generated);
          await deps.log(query, [payload.url, payload.answer].filter(Boolean).join("\n"));
          return json(req, payload);
        }
        await deps.log(query, generated);
        return message(req, generated);
      } catch (error) {
        console.error("[chatbot] request failed", error instanceof Error ? error.message : "Unknown error");
        return message(req, "Currently unavailable. Please try again later.", 503);
      }
    },
  };
}

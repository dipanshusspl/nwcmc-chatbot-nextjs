import { NextResponse } from "next/server";
import { answerQuery, logChat } from "@/lib/answer";
import { MAX_CHAT_QUERY_LEN } from "@/lib/constants";
import { isRateLimited } from "@/lib/rate-limit";
import { corsHeaders, readBody } from "@/lib/security";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const json = (req: Request, body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: corsHeaders(req) });

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

/** Public endpoint used by the embeddable widget (multi-FAQ matching). */
export async function POST(req: Request) {
  if (await isRateLimited(req.headers, "chat_api")) {
    return json(req, { response: "Too many requests. Please slow down." }, 429);
  }
  const body = await readBody(req);
  if (body === null) return json(req, { response: "Request body too large." }, 413);

  const raw = body.query || body.message || "";
  const query = String(raw).trim().slice(0, MAX_CHAT_QUERY_LEN);
  if (!query) return json(req, { response: "Please enter a valid question." }, 400);

  const response = await answerQuery(query, true);
  await logChat(query, response);
  return json(req, { response });
}

export async function GET(req: Request) {
  return json(req, { response: "Method not allowed." }, 405);
}

import { NextResponse } from "next/server";
import { answerQuery, logChat } from "@/lib/answer";
import { MAX_CHAT_QUERY_LEN } from "@/lib/constants";
import { isRateLimited } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/** Same-origin endpoint used by the main chat page (single-FAQ matching). */
export async function POST(req: Request) {
  if (await isRateLimited(req.headers, "query_chatbot")) {
    return NextResponse.json({ response: "Too many requests. Please slow down." }, { status: 429 });
  }
  let message = "";
  try {
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      message = String((await req.json())?.message ?? "");
    } else {
      message = String((await req.formData()).get("message") ?? "");
    }
  } catch { /* empty */ }
  message = message.trim().slice(0, MAX_CHAT_QUERY_LEN);
  if (!message) return NextResponse.json({ response: "Please enter a valid question." }, { status: 400 });

  const response = await answerQuery(message, false);
  await logChat(message, response);
  return NextResponse.json({ response });
}

export async function GET() {
  return NextResponse.json({ response: "Method not allowed." }, { status: 405 });
}

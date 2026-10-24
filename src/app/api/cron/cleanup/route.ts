import { NextResponse } from "next/server";
import { CHATLOG_RETENTION_DAYS } from "@/lib/constants";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Daily job (vercel.json): deletes chat logs older than 20 days (replaces Django's `scheduler` command). */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sql = db();
  const deleted = await sql`
    delete from chatbot_chatlog
    where created_at < now() - (${CHATLOG_RETENTION_DAYS}::int * interval '1 day')`;
  await sql`delete from chatbot_ratelimit where window_start < now() - interval '1 day'`;
  return NextResponse.json({ ok: true, deleted: deleted.count });
}

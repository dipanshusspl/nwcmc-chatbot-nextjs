import { db } from "./db";
import { clientIp } from "./security";
import { RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_SECONDS } from "./constants";

/** Fixed-window limiter stored in Postgres (works across serverless instances).
 *  Returns true when the request should be BLOCKED. Fails open on DB errors. */
export async function isRateLimited(
  headers: Headers,
  name: string,
  limit = RATE_LIMIT_MAX_REQUESTS,
  windowSec = RATE_LIMIT_WINDOW_SECONDS,
): Promise<boolean> {
  const key = `${name}:${clientIp(headers)}`;
  try {
    const sql = db();
    const rows = await sql<{ count: number }[]>`
      insert into chatbot_ratelimit (key, count, window_start)
      values (${key}, 1, now())
      on conflict (key) do update set
        count = case when chatbot_ratelimit.window_start < now() - (${windowSec}::int * interval '1 second')
                     then 1 else chatbot_ratelimit.count + 1 end,
        window_start = case when chatbot_ratelimit.window_start < now() - (${windowSec}::int * interval '1 second')
                     then now() else chatbot_ratelimit.window_start end
      returning count`;
    return rows[0].count > limit;
  } catch (err) {
    console.warn("[rate-limit] error", err);
    return false;
  }
}

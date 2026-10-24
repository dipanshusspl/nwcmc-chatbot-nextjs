import postgres from "postgres";

type Sql = postgres.Sql;
const g = globalThis as unknown as { __sql?: Sql };

/** Lazily-created Postgres client (Supabase). Safe for serverless: small pool, no prepared statements. */
export function db(): Sql {
  if (g.__sql) return g.__sql;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const local = /@(localhost|127\.0\.0\.1)(:|\/)/.test(url);
  g.__sql = postgres(url, {
    ssl: local ? false : "require",
    prepare: false, // required for Supabase transaction pooler (port 6543)
    max: 3,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  return g.__sql;
}

export interface FaqRow { id: string; question: string; answer: string; created_at: Date; updated_at: Date }
export interface ChatLogRow { id: string; user: string | null; request_text: string; response_text: string | null; created_at: Date }
export interface SavedUrlRow { id: string; url: string; content_hash: string | null; last_synced_at: Date | null; created_at: Date }

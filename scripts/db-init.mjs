// Applies supabase/schema.sql using DATABASE_URL.  Usage: npm run db:init
import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

for (const f of [".env.local", ".env"]) {
  const p = path.resolve(f);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set (put it in .env.local).");
  process.exit(1);
}
const local = /@(localhost|127\.0\.0\.1)/.test(process.env.DATABASE_URL);
const sql = postgres(process.env.DATABASE_URL, { ssl: local ? false : "require", prepare: false, max: 1 });
const ddl = fs.readFileSync(path.resolve("supabase/schema.sql"), "utf8");
try {
  await sql.unsafe(ddl);
  console.log("Schema applied successfully.");
} catch (e) {
  console.error("Failed:", e.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import postgres from "postgres";
import { db } from "../src/lib/db";
import { getAiProvider, setAiProvider, completeText, isAiProvider } from "../src/lib/llm";
import { answerQuery } from "../src/lib/answer";
import { GET as cleanup } from "../src/app/api/cron/cleanup/route";

// These tests DROP application tables: only use a disposable local test database.
const url = process.env.TEST_DATABASE_URL;
const enabled = Boolean(url);
if (url && (!/@(localhost|127\.0\.0\.1)(:|\/)/.test(url) || !new URL(url).pathname.endsWith("_test"))) {
  throw new Error("TEST_DATABASE_URL must be a localhost database whose name ends in _test.");
}

test("database integration: migration, provider switching, grounded replies, and batch cleanup", { skip: !enabled }, async (t) => {
  process.env.DATABASE_URL = url!;
  process.env.AI_PROVIDER = "groq";
  process.env.GROQ_API_KEY = "test-key-not-real";
  process.env.GEMINI_API_KEY = "test-key-not-real";
  process.env.CRON_SECRET = "test-cron-secret-not-real";
  const sql = db();
  const migration = await fs.readFile(new URL("../supabase/migrations/20261024_whatsapp_provider_retention.sql", import.meta.url), "utf8");
  const schema = await fs.readFile(new URL("../supabase/schema.sql", import.meta.url), "utf8");
  await sql.unsafe(`drop table if exists chatbot_settings, chatbot_retention_state, chatbot_ratelimit, chatbot_chatlog, chatbot_faq, chatbot_urlchunk_tbl, chatbot_url, "chatbot_IVC" cascade`);
  await sql.unsafe(schema);
  await sql`drop table chatbot_ratelimit`;
  const migrationSql = postgres(url!, { max: 1, prepare: false });
  try {
    await migrationSql.unsafe(migration);
    await migrationSql.unsafe(migration);
  } finally {
    await migrationSql.end();
  }
  const globals = globalThis as unknown as { __groq?: unknown };
  const originalGroq = globals.__groq;
  const originalFetch = globalThis.fetch;
  try {
    await t.test("migration is idempotent and new tables have RLS", async () => {
      const rows = await sql`select relname, relrowsecurity from pg_class where relname in ('chatbot_settings', 'chatbot_retention_state', 'chatbot_ratelimit')`;
      assert.equal(rows.length, 3);
      assert.ok(rows.every((row) => row.relrowsecurity));
      assert.ok(await sql`select key from chatbot_ratelimit`);
      assert.equal((await sql`select * from chatbot_retention_state`).length, 1);
      await assert.rejects(sql`insert into chatbot_settings (key, value) values ('ai_provider', 'invalid')`);
    });

    await t.test("provider selection persists across independent DB clients and rejects missing keys", async () => {
      assert.equal(await getAiProvider(), "groq");
      assert.equal(isAiProvider("other"), false);
      await setAiProvider("gemini");
      const separate = postgres(url!, { max: 1, prepare: false });
      try { assert.equal((await separate`select value from chatbot_settings where key='ai_provider'`)[0].value, "gemini"); }
      finally { await separate.end(); }
      delete process.env.GROQ_API_KEY;
      await assert.rejects(setAiProvider("groq"), /GROQ_API_KEY/);
      assert.equal(await getAiProvider(), "gemini");
      process.env.GROQ_API_KEY = "test-key-not-real";
    });

    await t.test("Groq and Gemini use the selected backend with grounded short/full prompts", async () => {
      await sql`insert into chatbot_faq (question, answer) values ('Where is the municipal office?', 'The municipal office is in Nanded.')`;
      globals.__groq = { chat: { completions: { create: async (input: { messages: { content: string }[] }) => {
        assert.ok(input.messages[1].content.includes("The municipal office is in Nanded."));
        return { choices: [{ message: { content: "The municipal office is in Nanded." } }] };
      } } } };
      await setAiProvider("groq");
      assert.equal(await answerQuery("Where is the municipal office?", true), "The municipal office is in Nanded.");
      globalThis.fetch = (async (input, init) => {
        assert.ok(String(input).includes(":generateContent"));
        assert.equal(new Headers(init?.headers).get("x-goog-api-key"), "test-key-not-real");
        const body = JSON.parse(String(init?.body));
        assert.ok(body.systemInstruction.parts[0].text.includes("250 characters"));
        assert.ok(body.contents[0].parts[0].text.includes("The municipal office is in Nanded."));
        return Response.json({ candidates: [{ finishReason: "STOP", content: { parts: [
          { text: "private thought", thought: true }, { text: "Office: Nanded. ".repeat(40) },
        ] } }] });
      }) as typeof fetch;
      await setAiProvider("gemini");
      const short = await answerQuery("Where is the municipal office?", true, true);
      assert.ok(short.length <= 250);
      assert.ok(short.startsWith("Office: Nanded."));
      assert.ok(!short.includes("private thought"));
      globalThis.fetch = (async () => new Response("test failure", { status: 429 })) as typeof fetch;
      await assert.rejects(completeText({ system: "test", user: "test" }), /429/);
      globalThis.fetch = (async () => Response.json({ candidates: [{ finishReason: "SAFETY", content: { parts: [{ text: "blocked" }] } }] })) as typeof fetch;
      assert.equal(await completeText({ system: "test", user: "test" }), "");
    });

    await t.test("cleanup rejects unauthorized calls", async () => {
      const response = await cleanup(new Request("https://example.com/api/cron/cleanup/"));
      assert.equal(response.status, 401);
    });

    const run = () => cleanup(new Request("https://example.com/api/cron/cleanup/", {
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    }));
    async function seed(age: number) {
      await sql`truncate chatbot_chatlog restart identity`;
      await sql`update chatbot_retention_state set anchor_at = now() - (${age} * interval '1 day'), last_cutoff_at = null where id = 1`;
      await sql`insert into chatbot_chatlog (request_text, created_at)
        select 'Day ' || d, anchor_at + ((d - 1) * interval '1 day')
        from chatbot_retention_state, generate_series(1, ${age}) d`;
    }
    await t.test("day 59 keeps all logs; day 60 deletes days 1-30 and retains 31-60", async () => {
      await seed(59);
      assert.equal((await (await run()).json()).deleted, 0);
      assert.equal((await sql`select count(*)::int as n from chatbot_chatlog`)[0].n, 59);
      await seed(60);
      const response = await run(); assert.equal(response.status, 200);
      const result = await response.json(); assert.equal(result.deleted, 30);
      const rows = await sql`select request_text from chatbot_chatlog order by created_at`;
      assert.equal(rows.length, 30);
      assert.equal(rows[0].request_text, "Day 31");
      assert.equal(rows[29].request_text, "Day 60");
      assert.equal((await (await run()).json()).deleted, 0);
    });
    await t.test("day 90 removes days 1-60; overlapping runs are safe", async () => {
      await seed(90);
      const results = await Promise.all([run(), run()]);
      const bodies = await Promise.all(results.map((r) => r.json()));
      assert.equal(bodies.reduce((n, b) => n + b.deleted, 0), 60);
      const rows = await sql`select request_text from chatbot_chatlog order by created_at`;
      assert.equal(rows.length, 30);
      assert.equal(rows[0].request_text, "Day 61");
    });
    await t.test("missed jobs catch up without deleting the current block", async () => {
      await seed(151);
      const result = await (await run()).json();
      assert.equal(result.deleted, 120);
      assert.equal((await sql`select count(*)::int as n from chatbot_chatlog`)[0].n, 31);
    });
  } finally {
    globalThis.fetch = originalFetch;
    globals.__groq = originalGroq;
    await sql.end();
  }
});

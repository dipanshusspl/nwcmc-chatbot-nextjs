import test from "node:test";
import assert from "node:assert/strict";
import { limitShortAnswer, plainText, splitQueryAnswer, WHATSAPP_MAX_CHARACTERS } from "../src/lib/short-answer";
import { retentionWindow } from "../src/lib/retention";
import { createChatHandler } from "../src/lib/chat-handler";
import { readBody } from "../src/lib/security";

const day = 86_400_000;
const anchor = new Date("2026-01-01T00:00:00.000Z");
const after = (days: number) => new Date(+anchor + days * day);

test("short answers: preserve short text and enforce English, Marathi, emoji and URL limits", () => {
  assert.equal(limitShortAnswer("Tax is due on 31 March."), "Tax is due on 31 March.");
  for (const text of ["Long answer ".repeat(100), "नांदेड महानगरपालिका माहिती ".repeat(100), "👨‍👩‍👧‍👦 ".repeat(40), "a".repeat(500), "https://example.com/" + "x".repeat(500)]) {
    const result = limitShortAnswer(text);
    assert.ok(result.length <= WHATSAPP_MAX_CHARACTERS);
    assert.ok([...result].length <= WHATSAPP_MAX_CHARACTERS);
    assert.ok(!/[\uD800-\uDBFF]$/.test(result));
    assert.ok(result.endsWith("…"));
  }
  assert.equal(limitShortAnswer("a".repeat(500)).length, WHATSAPP_MAX_CHARACTERS);
  assert.equal(plainText("# Title\n**Important** [Office](https://example.com)"), "Title Important Office (https://example.com)");
  assert.equal(plainText("<think>private</think>Answer"), "Answer");
});

test("short query response extracts only valid URLs and caps answer text independently", () => {
  assert.deepEqual(splitQueryAnswer("Office hours are 9-5. https://example.com/office"), {
    url: "https://example.com/office",
    answer: "Office hours are 9-5.",
  });
  const longUrl = `https://example.com/${"x".repeat(250)}`;
  const result = splitQueryAnswer(`Visit ${longUrl} ${"Additional details ".repeat(30)}`);
  assert.deepEqual(result, { answer: limitShortAnswer(`Visit ${"Additional details ".repeat(30)}`) });
  assert.ok(result.answer.length <= WHATSAPP_MAX_CHARACTERS);
});

test("short handler returns split fields and logs their combined content", async () => {
  const logs: string[][] = [];
  const handler = createChatHandler(true, {
    answer: async () => "Pay online at https://example.com/payment",
    log: async (...args) => { logs.push(args); },
    rateLimited: async () => false,
  });
  const data = await (await handler.POST(request({ query: "How do I pay?" }))).json();
  assert.deepEqual(data, { url: "https://example.com/payment", answer: "Pay online at" });
  assert.deepEqual(logs, [["How do I pay?", "https://example.com/payment\nPay online at"]]);
});

test("retention: first deletion at 60 days, then 30-day batches and missed-run catchup", () => {
  assert.equal(retentionWindow(anchor, after(0)).cutoff, null);
  assert.equal(retentionWindow(anchor, after(30)).cutoff, null);
  assert.equal(retentionWindow(anchor, new Date(+after(60) - 1)).cutoff, null);
  for (const [elapsed, cutoff] of [[60, 30], [61, 30], [89, 30], [90, 60], [120, 90], [151, 120]]) {
    const window = retentionWindow(anchor, after(elapsed));
    assert.equal(window.cutoff?.toISOString(), after(cutoff).toISOString());
    assert.ok(+window.nextCleanup > +after(elapsed));
  }
  assert.equal(retentionWindow(anchor, after(0)).nextCleanup.toISOString(), after(60).toISOString());
});

function harness(short: boolean, blocked = false) {
  const calls: unknown[][] = [];
  const logs: string[][] = [];
  const handler = createChatHandler(short, {
    answer: async (...args) => { calls.push(args); return "Grounded answer ".repeat(30); },
    log: async (...args) => { logs.push(args); },
    rateLimited: async () => blocked,
  });
  return { handler, calls, logs };
}
const request = (data: unknown) => new Request("https://example.com/api/query/", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
});

test("chat/query share multi-FAQ retrieval and log exactly the returned response", async () => {
  for (const short of [false, true]) {
    for (const field of ["query", "message", "Body"]) {
      const { handler, calls, logs } = harness(short);
      const response = await handler.POST(request({ [field]: "Mayor and deputy mayor" }));
      assert.equal(response.status, 200);
      const data = await response.json();
      assert.deepEqual(calls, [["Mayor and deputy mayor", true, short]]);
      if (short) {
        assert.ok(data.answer.length > 150);
        assert.ok(data.answer.length <= WHATSAPP_MAX_CHARACTERS);
        assert.deepEqual(logs, [["Mayor and deputy mayor", data.answer]]);
      }
      else {
        assert.ok(data.response.length > WHATSAPP_MAX_CHARACTERS);
        assert.deepEqual(logs, [["Mayor and deputy mayor", data.response]]);
      }
      assert.equal(response.headers.get("cache-control"), "no-store");
    }
  }
});

test("query supports JSON, urlencoded and legacy multipart form bodies", async () => {
  const form = new FormData(); form.set("message", "Office hours");
  const { handler, calls } = harness(true);
  assert.equal((await handler.POST(new Request("https://example.com/api/query/", { method: "POST", body: form }))).status, 200);
  assert.equal((await handler.POST(new Request("https://example.com/api/query/", {
    method: "POST", body: new URLSearchParams({ Body: "Office hours" }),
  }))).status, 200);
  assert.equal(calls.length, 2);
});

test("validation, body limit, rate limiting, OPTIONS and method restrictions", async () => {
  const { handler, calls } = harness(true);
  for (const data of [{}, { message: " " }, { query: { bad: 1 } }, ["bad"]]) {
    assert.equal((await handler.POST(request(data))).status, 400);
  }
  assert.equal((await handler.POST(request({ message: "x".repeat(20_000) }))).status, 413);
  assert.equal((await handler.POST(request({ message: "x".repeat(2500) }))).status, 200);
  assert.equal(String(calls[0][0]).length, 2000);
  assert.equal((await harness(true, true).handler.POST(request({ message: "test" }))).status, 429);
  assert.equal((await handler.GET(new Request("https://example.com/api/query/"))).status, 405);
  assert.equal((await handler.OPTIONS(new Request("https://example.com/api/query/"))).status, 204);
  assert.deepEqual(await readBody(new Request("https://example.com/", { method: "POST", body: "invalid JSON" })), {});
});

test("request failures return short safe errors rather than internal details", async () => {
  const handler = createChatHandler(true, {
    answer: async () => { throw new Error("test-only internal failure"); },
    log: async () => {}, rateLimited: async () => false,
  });
  const response = await handler.POST(request({ query: "test" }));
  assert.equal(response.status, 503);
  const data = await response.json();
  assert.ok(data.answer.length <= WHATSAPP_MAX_CHARACTERS);
  assert.ok(!data.answer.includes("internal"));
});

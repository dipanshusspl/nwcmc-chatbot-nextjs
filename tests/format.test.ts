import test from "node:test";
import assert from "node:assert/strict";
import { cleanUrlText, formatChatbotResponse, formatDateTime } from "../src/lib/format";

test("formatDateTime handles missing, invalid, and valid dates", () => {
  assert.equal(formatDateTime(null), "");
  assert.equal(formatDateTime("not-a-date"), "Unknown date");
  assert.equal(formatDateTime(new Date(Number.NaN)), "Unknown date");
  assert.notEqual(formatDateTime("2026-10-26T00:00:00.000Z"), "Unknown date");
});

test("URL cleanup repairs broken separators and preserves normal chatbot text", () => {
  assert.equal(cleanUrlText("Visit https: // example.com / pay?mode=online"), "Visit https://example.com/pay?mode=online");
  assert.equal(cleanUrlText("See https://example.com. More information"), "See https://example.com. More information");
  assert.equal(formatChatbotResponse("  Answer https://example.com  "), "Answer https://example.com");
});

"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  ALLOWED_UPLOAD_EXTENSIONS, MAX_ADMIN_TEXT_LEN, MAX_EXTRACTED_TEXT, MAX_UPLOAD_BYTES, MAX_URL_LENGTH,
} from "@/lib/constants";
import { db, type SavedUrlRow } from "@/lib/db";
import { chunkText, extractPdfText, syncSavedUrl } from "@/lib/ingest";
import { isSafePublicUrl } from "@/lib/security";
import { stripNul } from "@/lib/text";

export interface ActionState { success?: string; error?: string; nonce?: number }
const done = (success: string): ActionState => ({ success, nonce: Date.now() });
const fail = (error: string): ActionState => ({ error, nonce: Date.now() });

// ----------------------------------------------------------------- FAQs
export async function saveFaq(_p: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(fd.get("faq_id") ?? "").trim();
  const question = stripNul(String(fd.get("question") ?? "").trim()).slice(0, MAX_ADMIN_TEXT_LEN);
  const answer = stripNul(String(fd.get("answer") ?? "").trim()).slice(0, MAX_ADMIN_TEXT_LEN);
  if (!question || !answer) return fail("Please enter both a question and an answer.");

  const sql = db();
  if (id) {
    if (!/^\d+$/.test(id)) return fail("Invalid FAQ reference.");
    const r = await sql`update chatbot_faq set question = ${question}, answer = ${answer}, updated_at = now() where id = ${id}`;
    if (!r.count) return fail("FAQ not found.");
    revalidatePath("/admin-panel/faqs/");
    return done("FAQ updated successfully.");
  }
  await sql`insert into chatbot_faq (question, answer) values (${question}, ${answer})`;
  revalidatePath("/admin-panel/faqs/");
  return done("FAQ added successfully.");
}

export async function deleteFaq(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = String(fd.get("faq_id") ?? "");
  if (/^\d+$/.test(id)) await db()`delete from chatbot_faq where id = ${id}`;
  revalidatePath("/admin-panel/faqs/");
}

// ----------------------------------------------------------------- File ingestion
export async function uploadFile(_p: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const file = fd.get("file");
  if (!(file instanceof File) || !file.size) return fail("Please choose a file to upload.");

  const fileName = (file.name.split(/[\\/]/).pop() || "upload.bin").replace(/\u0000/g, "").slice(0, 255);
  const ext = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".")).toLowerCase() : "";

  if (file.size > MAX_UPLOAD_BYTES) return fail("File is too large (maximum 4 MB).");
  if (!ALLOWED_UPLOAD_EXTENSIONS.has(ext)) return fail("Only .pdf and .txt files are allowed.");

  let text = "";
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    text = ext === ".pdf" ? await extractPdfText(bytes) : new TextDecoder("utf-8").decode(bytes);
  } catch (e) {
    console.warn("[admin_file] failed to parse upload", e);
    return fail("Failed to parse the uploaded file. Please check the file and try again.");
  }
  text = stripNul(text).slice(0, MAX_EXTRACTED_TEXT);
  if (!text.trim()) return fail("No readable text could be extracted from this file.");

  const rows = chunkText(text)
    .filter((c) => c.trim().length >= 20)
    .map((content) => ({ content, source: fileName }));
  if (!rows.length) return fail("No readable text could be extracted from this file.");

  try {
    await db().begin(async (tx) => {
      await tx`insert into "chatbot_IVC" ${tx(rows, "content", "source")}`;
    });
  } catch (e) {
    console.error("[admin_file] processing failed", e);
    return fail("An internal error occurred while processing the file.");
  }
  revalidatePath("/admin-panel/file/");
  revalidatePath("/admin-panel/");
  return done("Document parsed and ingested successfully!");
}

// ----------------------------------------------------------------- Website URLs
export async function urlAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const action = String(fd.get("action") ?? "");
  const sql = db();

  try {
    if (action === "save_url") {
      const url = String(fd.get("url") ?? "").trim().slice(0, MAX_URL_LENGTH);
      if (!url) return fail("Please provide a valid URL.");
      if (!isSafePublicUrl(url)) return fail("That URL is not allowed (must be a public http/https address).");
      const inserted = await sql<SavedUrlRow[]>`insert into chatbot_url (url) values (${url}) on conflict (url) do nothing returning *`;
      const created = inserted.length > 0;
      const [row] = created ? inserted : await sql<SavedUrlRow[]>`select * from chatbot_url where url = ${url}`;
      const ok = await syncSavedUrl(row, true);
      if (!ok && created) {
        // Don't keep a dead entry around if the very first fetch failed
        await sql`delete from chatbot_url where id = ${row.id}`;
        return fail("Could not read any content from that URL. Check that it is public and returns an HTML page.");
      }
      revalidatePath("/admin-panel/url/");
      return done(created ? "URL connected and synced successfully!" : "This URL is already connected.");
    }

    const id = String(fd.get("url_id") ?? "");
    if (!/^\d+$/.test(id)) return fail("Invalid URL reference.");
    const [row] = await sql<SavedUrlRow[]>`select * from chatbot_url where id = ${id}`;
    if (!row) return fail("URL not found.");

    if (action === "sync_url") {
      const ok = await syncSavedUrl(row, true);
      revalidatePath("/admin-panel/url/");
      return ok ? done(`Successfully synced: ${row.url}`) : fail(`Failed to extract content from: ${row.url}`);
    }
    if (action === "delete_url") {
      await sql`delete from chatbot_url where id = ${id}`; // chunks removed by ON DELETE CASCADE
      revalidatePath("/admin-panel/url/");
      return done(`Successfully deleted URL and its chunks: ${row.url}`);
    }
    return fail("Unknown action.");
  } catch (e) {
    console.error("[admin_url] action failed", e);
    return fail("Something went wrong. Please try again.");
  }
}

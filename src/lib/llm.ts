import Groq from "groq-sdk";
import { db } from "./db";

export type AiProvider = "groq" | "gemini";
export function isAiProvider(value: unknown): value is AiProvider {
  return value === "groq" || value === "gemini";
}
export function providerConfigured(provider: AiProvider): boolean {
  return Boolean((provider === "groq" ? process.env.GROQ_API_KEY : process.env.GEMINI_API_KEY)?.trim());
}

async function ensureChatbotSettingsTable(): Promise<void> {
  try {
    await db()`select 1 from chatbot_settings limit 1`;
    return;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/relation .*chatbot_settings.* does not exist/i.test(message)) throw error;
  }

  await db().unsafe(`
    create table if not exists public.chatbot_settings (
      key text primary key,
      value text not null,
      updated_at timestamptz not null default now(),
      constraint chatbot_settings_provider_check check (key <> 'ai_provider' or value in ('groq', 'gemini'))
    );
    alter table public.chatbot_settings enable row level security;
  `);
}

async function ensureChatbotRetentionTable(): Promise<void> {
  try {
    await db()`select 1 from chatbot_retention_state limit 1`;
    return;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/relation .*chatbot_retention_state.* does not exist/i.test(message)) throw error;
  }

  await db().unsafe(`
    create table if not exists public.chatbot_retention_state (
      id integer primary key check (id = 1),
      anchor_at timestamptz not null,
      last_cutoff_at timestamptz,
      last_run_at timestamptz
    );
    alter table public.chatbot_retention_state enable row level security;
    insert into public.chatbot_retention_state (id, anchor_at)
    select 1, coalesce(min(created_at), now()) from public.chatbot_chatlog
    on conflict (id) do nothing;
  `);
}

/** Read on every generation: changing the admin setting works across instances. */
export async function getAiProvider(): Promise<AiProvider> {
  await ensureChatbotSettingsTable();
  const [row] = await db()<{ value: string }[]>`
    select value from chatbot_settings where key = 'ai_provider'`;
  if (isAiProvider(row?.value)) return row.value;
  return isAiProvider(process.env.AI_PROVIDER) ? process.env.AI_PROVIDER : "groq";
}

export async function setAiProvider(provider: AiProvider): Promise<void> {
  if (!providerConfigured(provider)) throw new Error(`Configure the ${provider === "groq" ? "GROQ_API_KEY" : "GEMINI_API_KEY"} environment variable first.`);
  await ensureChatbotSettingsTable();
  await db()`insert into chatbot_settings (key, value) values ('ai_provider', ${provider})
    on conflict (key) do update set value = excluded.value, updated_at = now()`;
}

const g = globalThis as unknown as { __groq?: Groq };
export function groq(): Groq {
  if (!g.__groq) {
    if (!providerConfigured("groq")) throw new Error("GROQ_API_KEY is not set");
    g.__groq = new Groq({ apiKey: process.env.GROQ_API_KEY, timeout: 20_000, maxRetries: 0 });
  }
  return g.__groq;
}
export const CHAT_MODEL = () => process.env.GROQ_CHAT_MODEL || "openai/gpt-oss-120b";

export interface CompletionInput {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}

/** Both chatbot endpoints and admin insights use this same provider selector. */
export async function completeText(input: CompletionInput): Promise<string> {
  const provider = await getAiProvider();
  if (!providerConfigured(provider)) throw new Error(`${provider} API key is not configured`);
  const maxTokens = input.maxTokens ?? 1024;
  const temperature = input.temperature ?? 0;
  if (provider === "groq") {
    const model = CHAT_MODEL();
    const completion = await groq().chat.completions.create({
      model,
      messages: [
        { role: "system", content: input.system },
        { role: "user", content: input.user },
      ],
      temperature,
      max_tokens: maxTokens,
      ...(model.includes("gpt-oss") ? { reasoning_effort: "low" as const } : {}),
    });
    return (completion.choices[0]?.message?.content || "").trim();
  }

  const model = (process.env.GEMINI_CHAT_MODEL || "gemini-3.8-flash").replace(/^models\//, "");
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY! },
      signal: AbortSignal.timeout(20_000),
      cache: "no-store",
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: input.system }] },
        contents: [{ role: "user", parts: [{ text: input.user }] }],
        generationConfig: { temperature, maxOutputTokens: maxTokens },
      }),
    },
  );
  // Never include upstream response bodies or keys in user-facing errors.
  if (!response.ok) throw new Error(`Gemini request failed (${response.status})`);
  const data = await response.json() as {
    candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] }; finishReason?: string }[];
  };
  const candidate = data.candidates?.[0];
  if (candidate?.finishReason && !["STOP", "MAX_TOKENS"].includes(candidate.finishReason)) return "";
  return (candidate?.content?.parts || [])
    .filter((part) => !part.thought).map((part) => part.text || "").join("").trim();
}
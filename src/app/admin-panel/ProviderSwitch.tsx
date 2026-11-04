"use client";

import { useActionState } from "react";
import { changeAiProvider, type ActionState } from "./actions";
import type { AiProvider } from "@/lib/llm";

export default function ProviderSwitch({ active, groqReady, geminiReady }: {
  active: AiProvider; groqReady: boolean; geminiReady: boolean;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(changeAiProvider, {});
  const target = active === "groq" ? "gemini" : "groq";
  const ready = target === "groq" ? groqReady : geminiReady;
  return (
    <section className="glass-card border border-slate-800 rounded-2xl p-6 mb-8" aria-label="AI provider settings">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">AI Provider: <span className="text-amber-400">{active === "groq" ? "Groq" : "Gemini"}</span></h2>
          <p className="text-sm text-slate-400 mt-2">Applies to website chat, WhatsApp query replies and AI insights. Saved for all server instances.</p>
          <p className="text-xs text-slate-400 mt-2">Groq: {groqReady ? "key configured" : "key missing"} · Gemini: {geminiReady ? "key configured" : "key missing"}</p>
        </div>
        <form action={action}>
          <input type="hidden" name="provider" value={target} />
          <button type="submit" disabled={pending || !ready}
            className="px-5 py-3 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium whitespace-nowrap">
            {pending ? "Switching…" : `Switch to ${target === "groq" ? "Groq" : "Gemini"}`}
          </button>
        </form>
      </div>
      {!ready && <p className="text-sm text-amber-300 mt-3">Configure {target === "groq" ? "GROQ_API_KEY" : "GEMINI_API_KEY"} in the server environment and redeploy to enable switching.</p>}
      <p role="status" aria-live="polite" className={`text-sm mt-3 ${state.error ? "text-red-400" : "text-emerald-400"}`}>{state.error || state.success || ""}</p>
    </section>
  );
}

"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveFaq, deleteFaq, type ActionState } from "../actions";

export interface FaqItem { id: string; question: string; answer: string; created: string }

export default function FaqManager({ faqs }: { faqs: FaqItem[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveFaq, {});
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [search, setSearch] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) { formRef.current?.reset(); setEditing(null); }
  }, [state]);

  const term = search.toLowerCase().trim();
  const visible = faqs.filter((f) => f.question.toLowerCase().includes(term) || f.answer.toLowerCase().includes(term));

  return (
    <div>
      {state.success && <div className="mb-6 rounded-lg border border-green-700 bg-green-900/50 p-3 text-green-300">{state.success}</div>}
      {state.error && <div className="mb-6 rounded-lg border border-red-700 bg-red-900/50 p-3 text-red-300">{state.error}</div>}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-xl h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{editing ? "Edit FAQ" : "Add FAQ"}</h2>
            <span className="text-sm text-gray-400">Stored in FAQ table</span>
          </div>
          <form ref={formRef} action={action} key={editing?.id ?? "new"} className="space-y-4">
            <input type="hidden" name="faq_id" value={editing?.id ?? ""} />
            <div>
              <label className="block mb-2 text-sm text-gray-300">Question</label>
              <textarea name="question" rows={3} required maxLength={5000} defaultValue={editing?.question ?? ""}
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="block mb-2 text-sm text-gray-300">Answer</label>
              <textarea name="answer" rows={4} required maxLength={5000} defaultValue={editing?.answer ?? ""}
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-500" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={pending} className="flex-1 rounded-lg bg-amber-600 px-4 py-2 font-semibold hover:bg-amber-500 disabled:opacity-60 transition-colors">
                {pending ? "Saving..." : editing ? "Update FAQ" : "Submit FAQ"}
              </button>
              {editing && (
                <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 transition-colors">Cancel</button>
              )}
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-4">FAQ Added List</h2>
          {faqs.length ? (
            <>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search FAQs by question or answer..."
                className="w-full mb-4 rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-500" />
              <div className="space-y-4 max-h-[520px] overflow-auto pr-2">
                {visible.map((f) => (
                  <div key={f.id} className="rounded-xl border border-gray-800 bg-gray-950 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-amber-300 whitespace-pre-wrap">{f.question}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        <button type="button" onClick={() => { setEditing(f); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          className="text-xs px-2 py-1 rounded bg-amber-800/70 hover:bg-amber-700 text-amber-100 border border-amber-700 transition-colors">Edit</button>
                        <form action={deleteFaq} onSubmit={(e) => { if (!confirm("Delete this FAQ?")) e.preventDefault(); }}>
                          <input type="hidden" name="faq_id" value={f.id} />
                          <button type="submit" className="text-xs px-2 py-1 rounded bg-red-800/70 hover:bg-red-700 text-red-100 transition-colors border border-red-700">Delete</button>
                        </form>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-400 whitespace-pre-wrap">{f.answer}</p>
                    <div className="mt-3 text-xs text-gray-500">Added {f.created}</div>
                  </div>
                ))}
                {!visible.length && <div className="text-gray-400 text-center py-4">No FAQs match your search.</div>}
              </div>
            </>
          ) : (
            <p className="text-gray-400">No FAQs added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useActionState, useEffect, useRef } from "react";
import { urlAction, type ActionState } from "../actions";
import { Alert, cardCls, inputCls, primaryBtn } from "@/components/ui";

export interface UrlItem { id: string; url: string }

export default function UrlManager({ urls }: { urls: UrlItem[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(urlAction, {});
  const addRef = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.success) addRef.current?.reset(); }, [state]);

  return (
    <>
      {state.success && <Alert kind="success"><p><strong>Success:</strong> {state.success}</p></Alert>}
      {state.error && <Alert kind="error"><p><strong>Notice:</strong> {state.error}</p></Alert>}
      {pending && <Alert kind="success"><p>Working... fetching and indexing the page can take several seconds.</p></Alert>}

      <div className={`${cardCls} mb-8`}>
        <h2 className="text-xl font-bold text-gray-50 mb-6">Target URL Configuration</h2>
        <form ref={addRef} action={action} className="flex flex-col gap-5">
          <input type="hidden" name="action" value="save_url" />
          <div>
            <label htmlFor="url-input" className="block text-sm font-medium text-slate-400 mb-2">Website Link</label>
            <input id="url-input" type="url" name="url" required maxLength={2048} placeholder="Paste website URL here (e.g., https://example.com)" className={inputCls} />
          </div>
          <button type="submit" disabled={pending} className={`w-full sm:w-auto sm:self-end ${primaryBtn}`}>Connect URL</button>
        </form>
      </div>

      <div className={cardCls}>
        <h2 className="text-xl font-bold text-gray-50 mb-6">Connected URLs</h2>
        {urls.length ? (
          <div className="space-y-3">
            {urls.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-700">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <a href={u.url} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-amber-400 truncate transition-colors">{u.url}</a>
                </div>
                <div className="shrink-0 flex items-center gap-2.5">
                  <span className="hidden sm:inline text-xs font-medium px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">Connected</span>
                  <form action={action}>
                    <input type="hidden" name="action" value="sync_url" />
                    <input type="hidden" name="url_id" value={u.id} />
                    <button type="submit" disabled={pending} title="Sync / Re-fetch URL Content"
                      className="px-3 py-1.5 text-xs text-slate-300 hover:text-blue-400 hover:bg-blue-500/10 border border-slate-700 rounded-lg transition-colors">Sync</button>
                  </form>
                  <form action={action} onSubmit={(e) => { if (!confirm("Delete this URL and all its stored text chunks?")) e.preventDefault(); }}>
                    <input type="hidden" name="action" value="delete_url" />
                    <input type="hidden" name="url_id" value={u.id} />
                    <button type="submit" disabled={pending} title="Delete URL and associated chunks"
                      className="px-3 py-1.5 text-xs text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-700 rounded-lg transition-colors">Delete</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 px-4 rounded-xl border border-dashed border-slate-600/50 bg-slate-900/20">
            <p className="text-slate-400 font-medium">No URLs connected yet</p>
            <p className="text-slate-500 text-sm mt-1">Add a link above to get started.</p>
          </div>
        )}
      </div>
    </>
  );
}

"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { uploadFile, type ActionState } from "../actions";
import { Alert, primaryBtn } from "@/components/ui";

export default function UploadForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(uploadFile, {});
  const [name, setName] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.success) { formRef.current?.reset(); setName(""); } }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-6">
      {state.success && <Alert kind="success"><p>{state.success}</p></Alert>}
      {state.error && <Alert kind="error"><p><strong>Error:</strong> {state.error}</p></Alert>}
      <label className="block cursor-pointer border-2 border-dashed border-slate-600 bg-slate-900/40 rounded-xl p-8 text-center hover:border-amber-500 hover:bg-slate-800/60 transition-all">
        <input type="file" name="file" accept=".txt,.pdf" required className="hidden"
          onChange={(e) => setName(e.target.files?.[0]?.name ?? "")} />
        {name ? (
          <p className="text-sm text-amber-400 font-medium break-all">{name}</p>
        ) : (
          <>
            <p className="text-sm text-slate-300 font-medium"><span className="text-amber-500">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-slate-500 mt-2 font-mono">PDF or TXT (Max: 4MB)</p>
          </>
        )}
      </label>
      <button type="submit" disabled={pending} className={`w-full ${primaryBtn}`}>
        {pending ? "Processing..." : "Process Document"}
      </button>
    </form>
  );
}

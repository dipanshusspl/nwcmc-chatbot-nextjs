"use client";

import Script from "next/script";
import { useState } from "react";

declare global { interface Window { AIChatbot?: { init: (c: unknown) => void; initialized?: boolean } } }

export default function EmbedClient({ snippet, apiUrl }: { snippet: string; apiUrl: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <>
      <div className="glass-card border border-slate-800 rounded-2xl p-6 shadow-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-100">Embed Snippet</h2>
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(snippet);
              setCopied(true);
              setTimeout(() => setCopied(false), 2500);
            }}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition"
          >Copy Code</button>
        </div>
        <pre className="bg-[#0b1220] border border-gray-800 rounded-xl p-4 font-mono text-[13px] text-gray-200 overflow-x-auto whitespace-pre">{snippet}</pre>
        {copied && <p className="mt-3 text-xs text-emerald-400">✓ Copied to clipboard!</p>}
      </div>
      <Script
        src="/widget.js"
        strategy="afterInteractive"
        onReady={() => {
          if (window.AIChatbot && !window.AIChatbot.initialized) {
            window.AIChatbot.init({ apiUrl, theme: { primaryColor: "#2a3864", fontFamily: "sans-serif" } });
          }
        }}
      />
    </>
  );
}

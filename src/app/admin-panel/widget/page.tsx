import { headers } from "next/headers";
import { BackLink } from "@/components/ui";
import EmbedClient from "./EmbedClient";

export const metadata = { title: "Embed Widget | Admin" };

export default async function WidgetAdminPage() {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const base = (process.env.NEXT_PUBLIC_SITE_URL || `${proto}://${host}`).replace(/\/$/, "");
  const apiUrl = `${base}/api/chat/`;

  const snippet = `<!-- NWCMC Chatbot Widget -->
<script src="${base}/widget.js"></script>
<script>
  document.addEventListener("DOMContentLoaded", function() {
    if (window.AIChatbot) {
      window.AIChatbot.init({
        apiUrl: '${apiUrl}',
        theme: {
          primaryColor: '#2a3864',
          fontFamily: 'sans-serif'
        }
      });
    }
  });
</script>`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-end gap-2 mb-6">
          <BackLink label="← Dashboard" />
          <a href="/admin-logout/" className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white transition-colors">Logout</a>
        </div>
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-200 via-emerald-400 to-cyan-300 bg-clip-text text-transparent">Embed Your Chatbot Widget</h1>
        </header>
        <EmbedClient snippet={snippet} apiUrl={apiUrl} />
        <div className="glass-card border border-slate-800 rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-3">How it works</h2>
          <ol className="list-decimal list-inside text-sm text-slate-300 space-y-2">
            <li>Copy the snippet above.</li>
            <li>Paste it just before the closing <code className="text-amber-300">&lt;/body&gt;</code> tag of any HTML page on your website.</li>
            <li>A small circular chat icon appears at the bottom-right of the page.</li>
            <li>When a visitor clicks it, the chatbot opens in a floating window.</li>
            <li>Make sure that website&apos;s origin is listed in the <code className="text-amber-300">CORS_ALLOWED_ORIGINS</code> environment variable.</li>
          </ol>
        </div>
        <div className="glass-card border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-slate-100 mb-3">Live Preview</h2>
          <p className="text-sm text-slate-400 mb-4">The widget is already loaded on this page — check the bottom-right corner!</p>
          <a href="/widget/demo/" target="_blank" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition">Open Demo Page ↗</a>
        </div>
      </div>
    </div>
  );
}

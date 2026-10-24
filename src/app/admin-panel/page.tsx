import Link from "next/link";
import { db } from "@/lib/db";

const cards = [
  { href: "/admin-panel/faqs/", title: "FAQ Management", desc: "Add and see frequently asked questions.", cta: "Configure FAQs", c: "amber" },
  { href: "/admin-panel/file/", title: "File Ingestion", desc: "Upload and process documents to enhance the chatbot's knowledge base.", cta: "Upload Dataset", c: "cyan" },
  { href: "/admin-panel/summary/", title: "Summary", desc: "View the user asked questions and chatbot responses.", cta: "View Analytics", c: "purple" },
  { href: "/admin-panel/ai-summary/", title: "Preferenced Summary", desc: "Generate an AI analysis of all user queries and responses.", cta: "Generate Analysis", c: "indigo" },
  { href: "/admin-panel/url/", title: "Live URL", desc: "Connect a web page as a knowledge source.", cta: "Connect URL", c: "blue" },
  { href: "/admin-panel/widget/", title: "Embed Widget", desc: "Get the snippet to embed the chatbot on any website.", cta: "Get Embed Code", c: "emerald" },
] as const;

// Tailwind needs full class names (no string interpolation)
const styles: Record<string, { hover: string; icon: string; text: string }> = {
  amber: { hover: "hover:border-amber-500/50", icon: "bg-amber-500/10 border-amber-500/20 text-amber-400", text: "text-amber-400" },
  cyan: { hover: "hover:border-cyan-500/50", icon: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400", text: "text-cyan-400" },
  purple: { hover: "hover:border-purple-500/50", icon: "bg-purple-500/10 border-purple-500/20 text-purple-400", text: "text-purple-400" },
  indigo: { hover: "hover:border-indigo-500/50", icon: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400", text: "text-indigo-400" },
  blue: { hover: "hover:border-blue-500/50", icon: "bg-blue-500/10 border-blue-500/20 text-blue-400", text: "text-blue-400" },
  emerald: { hover: "hover:border-emerald-500/50", icon: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", text: "text-emerald-400" },
};

export default async function Dashboard() {
  const sql = db();
  const [[faqs], [files], [queries]] = await Promise.all([
    sql<{ n: number }[]>`select count(*)::int as n from chatbot_faq`,
    sql<{ n: number }[]>`select count(distinct source)::int as n from "chatbot_IVC"`,
    sql<{ n: number }[]>`select count(*)::int as n from chatbot_chatlog`,
  ]);
  const stats = [
    { label: "Total FAQs", value: faqs.n, color: "text-amber-400" },
    { label: "Total Files", value: files.n, color: "text-cyan-400" },
    { label: "Total Queries", value: queries.n, color: "text-emerald-400" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative">
      <div className="fixed inset-0 overflow-hidden opacity-30 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-600 rounded-full blur-[128px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-500 rounded-full blur-[128px]" />
      </div>
      <div className="absolute top-4 right-4 z-50">
        <a href="/admin-logout/" className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white transition-colors">Logout</a>
      </div>
      <div className="relative max-w-6xl mx-auto px-6 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">Admin Dashboard</h1>
          <p className="mt-3 text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Manage chatbot knowledge Base, FAQs, and conversation history from one place.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
          {stats.map((s) => (
            <div key={s.label} className="glass-card border border-slate-800 rounded-2xl p-5 shadow-lg">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{s.label}</p>
              <h3 className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</h3>
            </div>
          ))}
        </div>

        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((c) => {
            const st = styles[c.c];
            return (
              <Link key={c.href} href={c.href} className={`group glass-card border border-slate-800 rounded-2xl p-6 transition-all duration-300 ${st.hover} hover:-translate-y-1 hover:shadow-2xl`}>
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 text-lg font-bold ${st.icon}`}>{c.title[0]}</div>
                <h2 className="text-xl font-bold text-slate-100">{c.title}</h2>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{c.desc}</p>
                <div className={`mt-6 inline-flex items-center text-xs font-semibold gap-1 group-hover:gap-2 transition-all ${st.text}`}>
                  {c.cta} <span>&rarr;</span>
                </div>
              </Link>
            );
          })}
        </main>
      </div>
    </div>
  );
}

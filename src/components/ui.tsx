import Link from "next/link";

export function Alert({ kind, children }: { kind: "success" | "error"; children: React.ReactNode }) {
  const cls = kind === "success"
    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
    : "bg-rose-500/10 border-rose-500/20 text-rose-400";
  return <div className={`flex items-start gap-3 p-4 mb-6 text-sm border rounded-xl ${cls}`}>{children}</div>;
}

export function BackLink({ href = "/admin-panel/", label = "Back" }: { href?: string; label?: string }) {
  return (
    <Link href={href} className="px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-sm font-medium text-slate-200 transition-colors">
      {label}
    </Link>
  );
}

export function PageHeader({ title, subtitle, back = true }: { title: string; subtitle: string; back?: boolean }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
      <div className="flex-1 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200 tracking-tight pb-1">{title}</h1>
        <p className="text-slate-400 mt-1 text-sm md:text-base max-w-xl">{subtitle}</p>
      </div>
      {back && <BackLink label="Back to Dashboard" />}
    </div>
  );
}

export function Shell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-screen bg-[#0b1120] text-gray-100 relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-0">
        <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] rounded-full bg-amber-600/10 blur-[150px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[150px]" />
      </div>
      <div className={`relative ${wide ? "max-w-6xl" : "max-w-5xl"} mx-auto px-6 py-12`}>{children}</div>
    </div>
  );
}

export const cardCls = "bg-slate-800/40 backdrop-blur-xl p-7 rounded-2xl shadow-2xl border border-slate-700/60";
export const inputCls = "w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500";
export const primaryBtn = "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-60 text-white font-semibold py-3 px-8 rounded-xl shadow-lg transition-all";

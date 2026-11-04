import { db } from "@/lib/db";
import { PageHeader, Shell, cardCls } from "@/components/ui";
import UploadForm from "./UploadForm";

export const metadata = { title: "Admin Panel - Files" };
export const maxDuration = 60;

export default async function FilePage() {
  const files = await db()<{ source: string | null; chunks: number }[]>`
    select source, count(*)::int as chunks from "chatbot_IVC"
    group by source order by max(id) desc`;
  return (
    <Shell wide>
      <PageHeader title="Admin Panel" subtitle="Upload and process documents to enhance the chatbot's knowledge base." />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className={`lg:col-span-5 ${cardCls}`}>
          <h2 className="text-xl font-bold text-gray-50">NWCMC Knowledge Base</h2>
          <p className="text-slate-400 text-xs mt-1.5 mb-6">Add a new document to the database.</p>
          <UploadForm />
        </div>
        <div className={`lg:col-span-7 ${cardCls} h-fit`}>
          <h2 className="text-xl font-bold text-gray-50 mb-6">Active Files</h2>
          <div className="rounded-xl border border-slate-700 bg-slate-900/50 overflow-hidden">
            <div className="max-h-[320px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-800/90 border-b border-slate-700">
                  <tr className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <th className="px-6 py-4 w-24 text-center">S.No</th>
                    <th className="px-6 py-4">File Name</th>
                    <th className="px-6 py-4 text-right">Chunks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {files.map((f, i) => (
                    <tr key={`${f.source}-${i}`} className="text-sm text-slate-300 hover:bg-slate-800/40">
                      <td className="px-6 py-3 text-center text-slate-500">{i + 1}</td>
                      <td className="px-6 py-3 break-all">{f.source || "Unknown"}</td>
                      <td className="px-6 py-3 text-right text-slate-500">{f.chunks}</td>
                    </tr>
                  ))}
                  {!files.length && (
                    <tr><td colSpan={3} className="px-6 py-10 text-center text-slate-500">No files uploaded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

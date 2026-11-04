import { db, type ChatLogRow } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { BackLink } from "@/components/ui";

export const metadata = { title: "Admin Chat Summary" };

export default async function SummaryPage() {
  const logs = await db()<ChatLogRow[]>`select * from chatbot_chatlog order by created_at desc limit 500`;
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-400">Admin Panel</h1>
            <p className="text-gray-400 mt-1">View all user queries and assistant responses from the chat log.</p>
          </div>
          <BackLink />
        </div>
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-4">Chat Summary</h2>
          {logs.length ? (
            <div className="space-y-4 max-h-[700px] overflow-auto pr-2">
              {logs.map((log) => (
                <div key={log.id} className="rounded-xl border border-gray-800 bg-gray-950 p-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="font-semibold text-amber-300">{log.user || "Anonymous"}</p>
                    <p className="text-xs text-gray-500">{formatDateTime(log.created_at)}</p>
                  </div>
                  <div className="text-sm text-gray-300">
                    <p className="mb-2 whitespace-pre-wrap"><span className="font-semibold text-gray-100">Query:</span> {log.request_text}</p>
                    <p className="whitespace-pre-wrap"><span className="font-semibold text-gray-100">Response:</span> {log.response_text}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No chat history available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

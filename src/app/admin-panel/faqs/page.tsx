import { db, type FaqRow } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { BackLink } from "@/components/ui";
import FaqManager from "./FaqManager";

export const metadata = { title: "Admin FAQ" };

export default async function FaqPage() {
  const rows = await db()<FaqRow[]>`select * from chatbot_faq order by created_at desc`;
  const faqs = rows.map((r) => ({ id: String(r.id), question: r.question, answer: r.answer, created: formatDateTime(r.created_at) }));
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-400">FAQ Management</h1>
            <p className="text-gray-400 mt-1">Add, edit and remove the questions the chatbot answers first.</p>
          </div>
          <BackLink />
        </div>
        <FaqManager faqs={faqs} />
      </div>
    </div>
  );
}

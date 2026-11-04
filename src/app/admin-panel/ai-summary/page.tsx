import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CHAT_MODEL, groq } from "@/lib/answer";
import { db, type ChatLogRow } from "@/lib/db";
import { BackLink } from "@/components/ui";

export const metadata = { title: "AI Chatbot Insights" };
export const maxDuration = 60;

async function buildSummary(logs: ChatLogRow[]): Promise<string> {
  if (!logs.length) return "No chat logs available to summarize.";
  let prompt = "Here are the recent user interactions with our chatbot:\n\n";
  for (const l of logs) {
    prompt += `User: ${l.request_text.slice(0, 500)}\nBot: ${(l.response_text || "").slice(0, 600)}\n\n`;
  }
  prompt +=
    "Based on these logs, provide a comprehensive, structured summary following these exact rules:\n\n" +
    "1. Section 2 ('MOST FREQUENT USER QUESTIONS') MUST be formatted as a standard Markdown table with columns:\n" +
    "| Rank | Typical Question (English / Marathi) | Approx. Count |\n\n" +
    "2. Section 5 ('AREAS WHERE THE BOT STRUGGLED') MUST be formatted as a standard Markdown table with columns:\n" +
    "| Issue | Example Queries | Bot Response | Why it's a problem |\n\n" +
    "3. Use Markdown headings (#, ##, ###) and standard bullet points for all other sections.\n" +
    "4. CRITICAL: Do NOT wrap the overall output in a code block (```) and do NOT use raw HTML tags like <table>, <tr>, or <td>.";
  try {
    const r = await groq().chat.completions.create({
      model: CHAT_MODEL(),
      messages: [
        { role: "system", content: "You are an expert AI system analyst. Format all requested output in standard Markdown, strictly adhering to requested table structures." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    });
    return r.choices[0]?.message?.content || "";
  } catch (e) {
    console.error("[admin_ai_summary] generation failed", e);
    return "An error occurred while generating the summary. Please try again later.";
  }
}

export default async function AiSummaryPage() {
  const logs = await db()<ChatLogRow[]>`select * from chatbot_chatlog order by created_at desc limit 500`;
  const summary = await buildSummary(logs);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-12">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-300 via-indigo-400 to-indigo-300 bg-clip-text text-transparent">AI Chatbot Insights</h1>
            <p className="text-slate-400 mt-2 text-sm sm:text-base">
              Analysis based on the last <span className="text-indigo-400 font-semibold">{logs.length}</span> user interactions.
            </p>
          </div>
          <BackLink />
        </div>
        <div className="glass-card border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xl report-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

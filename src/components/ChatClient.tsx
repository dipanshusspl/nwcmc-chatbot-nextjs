"use client";

import { useEffect, useRef, useState } from "react";
import BotText from "./BotText";

interface Msg { id: number; role: "user" | "bot"; text: string }

export default function ChatClient() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 0,
      role: "bot",
      text: 'Welcome! I am your NWCMC Assistant. You can ask me questions about NWCMC. Please type your question below and click "Send" or press "Enter" to submit.',
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function send() {
    const message = input.trim();
    if (!message || loading) return;
    setMessages((m) => [...m, { id: nextId.current++, role: "user", text: message }]);
    setInput("");
    setLoading(true);
    let reply = "Currently not available😞 Please try again later.";
    try {
      const fd = new FormData();
      fd.append("message", message);
      const res = await fetch("/api/query/", { method: "POST", body: fd });
      const data = await res.json();
      if (data?.response) reply = String(data.response);
    } catch { /* keep default reply */ }
    setMessages((m) => [...m, { id: nextId.current++, role: "bot", text: reply }]);
    setLoading(false);
  }

  return (
    <div className="bg-gray-950 text-gray-100 min-h-screen flex flex-col justify-between">
      <header className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <h1 className="text-xl font-bold text-amber-500 tracking-wide">NWCMC CHATBOT</h1>
            <p className="text-xs text-gray-400">Choose how you want to get your solution</p>
          </div>
          <a href="/admin-login/" className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition">
            Admin Panel
          </a>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-4 max-w-3xl w-full mx-auto">
        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex items-start gap-3 justify-end">
              <div className="bg-gray-700 p-3 rounded-lg text-sm max-w-[85%] text-gray-100 whitespace-pre-wrap">{m.text}</div>
              <div className="bg-gray-600 text-white p-2 rounded-lg text-sm font-bold">You</div>
            </div>
          ) : (
            <div key={m.id} className="flex items-start gap-3">
              <div className="bg-amber-600 text-white p-2 rounded-lg text-sm font-bold">Bot</div>
              <div className="bg-gray-800 p-3 rounded-lg text-sm max-w-[85%] text-gray-200 whitespace-pre-wrap">
                <BotText text={m.text} />
              </div>
            </div>
          ),
        )}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="bg-amber-600 text-white p-2 rounded-lg text-sm font-bold">Bot</div>
            <div className="bg-gray-800 p-3 rounded-lg text-sm text-gray-400 italic animate-pulse">Loading Please Wait😊....</div>
          </div>
        )}
        <div ref={endRef} />
      </main>

      <footer className="bg-gray-900 p-4 border-t border-gray-800">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            maxLength={2000}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            placeholder="Ask something..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
          />
          <button onClick={send} disabled={loading} className="bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-medium transition">
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}

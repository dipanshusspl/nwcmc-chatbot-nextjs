import DemoClient from "./DemoClient";

export const metadata = { title: "Widget Demo Page" };

export default function WidgetDemo() {
  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen flex flex-col justify-between font-sans">
      <header className="w-full bg-white border-b border-slate-200 py-4 px-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">W</div>
          <span className="font-semibold text-lg text-slate-900">Widget Studio</span>
        </div>
        <span className="text-xs font-medium bg-emerald-100 text-emerald-800 py-1 px-3 rounded-full">v1.0 Ready</span>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-16 text-center flex-grow flex flex-col justify-center items-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">AI Assistant Integration Demo</h1>
        <p className="mt-4 text-lg text-slate-600 max-w-xl">
          Experience the embedded AI widget live. Click the floating chat bubble in the bottom-right corner to start a conversation.
        </p>
        <div className="mt-8 p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-left max-w-md w-full">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <p className="text-sm font-medium text-slate-700">Chat Server Endpoint Active</p>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-mono">/api/chat/</p>
        </div>
      </main>
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        &copy; Demo Environment. All rights reserved.
      </footer>
      <DemoClient />
    </div>
  );
}

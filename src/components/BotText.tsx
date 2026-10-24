const SAFE_HTTPS = /^https:\/\/[A-Za-z0-9._~:/?#@!$&'()*+,;=%-]+$/;

/** Renders bot text safely (React escapes everything) and turns https links into "Click Here" buttons. */
export default function BotText({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s<>"']+)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 0) return <span key={i}>{part}</span>;
        if (!SAFE_HTTPS.test(part)) return <span key={i}>{part}</span>;
        return (
          <span key={i} className="block my-2">
            <a
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/40 text-xs font-medium transition-colors shadow-sm"
            >
              <span>Click Here</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </span>
        );
      })}
    </>
  );
}

"use client";

import Script from "next/script";

declare global { interface Window { AIChatbot?: { init: (c: unknown) => void; initialized?: boolean } } }

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

// Same formatter as the Django demo: escape first, then turn URLs into compact buttons.
function formatBotResponse(text: string): string {
  if (!text) return "";
  return escapeHtml(text).replace(/(https:\/\/[^\s<]+[^<.,:;"')\]\s])/g, (url) =>
    `<span class="block my-0.5"><a href="${url}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:2px 6px;border:1px solid rgba(245,158,11,.3);background:rgba(245,158,11,.1);color:#d97706;border-radius:2px;font-size:10px;text-decoration:none">Click Here ↗</a></span>`);
}

export default function DemoClient() {
  return (
    <Script
      src="/widget.js"
      strategy="afterInteractive"
      onReady={() => {
        if (window.AIChatbot && !window.AIChatbot.initialized) {
          window.AIChatbot.init({
            apiUrl: `${window.location.origin}/api/chat/`,
            theme: { primaryColor: "#2a3864", fontFamily: "system-ui, -apple-system, sans-serif" },
            responseFormatter: formatBotResponse,
          });
        }
      }}
    />
  );
}

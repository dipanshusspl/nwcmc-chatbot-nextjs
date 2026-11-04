/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep the same URLs as the Django app (/api/chat/, /admin-panel/faqs/ ...)
  // so already-embedded widgets keep working without any change.
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    serverActions: {
      // Vercel serverless request bodies are capped at 4.5 MB.
      bodySizeLimit: "4.5mb",
    },
  },
  async headers() {
    return [
      {
        // The widget script is embedded on external sites
        source: "/widget.js",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, max-age=300, s-maxage=300" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        // Admin area must never be framed or cached
        source: "/admin-panel/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;

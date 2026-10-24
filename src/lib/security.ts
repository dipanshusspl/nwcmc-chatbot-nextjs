import dns from "node:dns/promises";
import net from "node:net";
import { ALLOWED_PAYMENT_LINK_HOSTS } from "./constants";

const blocked = new net.BlockList();
for (const [addr, bits] of [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8],
  ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.168.0.0", 16],
  ["198.18.0.0", 15], ["224.0.0.0", 4], ["240.0.0.0", 4],
] as const) blocked.addSubnet(addr, bits, "ipv4");
for (const [addr, bits] of [
  ["::", 128], ["::1", 128], ["fc00::", 7], ["fe80::", 10], ["::ffff:0:0", 96],
] as const) blocked.addSubnet(addr, bits, "ipv6");

function ipBlocked(ip: string): boolean {
  const fam = net.isIP(ip);
  if (!fam) return true;
  return blocked.check(ip, fam === 4 ? "ipv4" : "ipv6");
}

/** Cheap syntactic check: public http(s) URL, no credentials, not a private IP literal. */
export function isSafePublicUrl(url: string): boolean {
  let u: URL;
  try { u = new URL(url); } catch { return false; }
  if (u.protocol !== "http:" && u.protocol !== "https:") return false;
  if (u.username || u.password) return false;
  const host = u.hostname.replace(/^\[|\]$/g, "");
  if (!host) return false;
  if (net.isIP(host)) return !ipBlocked(host);
  return host.includes(".") && !host.endsWith(".local") && !host.endsWith(".internal");
}

/** Full SSRF check: also resolves DNS and rejects hostnames pointing at private ranges. */
export async function isSafePublicUrlResolved(url: string): Promise<boolean> {
  if (!isSafePublicUrl(url)) return false;
  const host = new URL(url).hostname.replace(/^\[|\]$/g, "");
  if (net.isIP(host)) return true;
  try {
    const addrs = await dns.lookup(host, { all: true });
    return addrs.length > 0 && addrs.every((a) => !ipBlocked(a.address));
  } catch {
    return false;
  }
}

/** Only forward payment links that point at the official NWCMC domain. */
export function sanitizePaymentLink(candidate: unknown, fallback: string): string {
  if (!candidate || typeof candidate !== "string") return fallback;
  try {
    const u = new URL(candidate.trim());
    if (u.protocol === "https:" && ALLOWED_PAYMENT_LINK_HOSTS.has(u.hostname)) return candidate.trim();
  } catch { /* fall through */ }
  return fallback;
}

/** Read a JSON (or urlencoded) body with a hard size cap. Returns null if too large, {} if invalid. */
export async function readBody(req: Request, maxBytes = 16 * 1024): Promise<Record<string, unknown> | null> {
  const raw = new Uint8Array(await req.arrayBuffer());
  if (raw.byteLength > maxBytes) return null;
  const text = new TextDecoder().decode(raw);
  const ct = (req.headers.get("content-type") || "").toLowerCase();
  try {
    if (ct.includes("application/x-www-form-urlencoded")) {
      return Object.fromEntries(new URLSearchParams(text));
    }
    if (ct.includes("multipart/form-data")) return {};
    const data = JSON.parse(text);
    return data && typeof data === "object" && !Array.isArray(data) ? data : {};
  } catch {
    return {};
  }
}

/** CORS headers for the public widget endpoints. */
export function corsHeaders(req: Request): Record<string, string> {
  const allowed = (process.env.CORS_ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const base = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
  if (!allowed.length) return { ...base, "Access-Control-Allow-Origin": "*" };
  const origin = req.headers.get("origin") || "";
  return allowed.includes(origin)
    ? { ...base, "Access-Control-Allow-Origin": origin, Vary: "Origin" }
    : { ...base, Vary: "Origin" };
}

export function clientIp(h: Headers): string {
  return (
    h.get("x-real-ip") ||
    h.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown"
  );
}

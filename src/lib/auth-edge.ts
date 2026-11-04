// Edge-runtime safe subset (middleware cannot import node:crypto / bcrypt / next/headers).
import { jwtVerify } from "jose";

export const SESSION_COOKIE = "nwcmc_admin";

export async function verifySessionToken(token: string | undefined): Promise<string | null> {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!token || !s || s.length < 32) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(s), { algorithms: ["HS256"] });
    return payload.role === "staff" && typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

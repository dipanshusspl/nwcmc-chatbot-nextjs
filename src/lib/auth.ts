import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE, verifySessionToken } from "./auth-edge";
export { SESSION_COOKIE, verifySessionToken };
const SESSION_HOURS = 8;

function secretKey(): Uint8Array {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("ADMIN_SESSION_SECRET must be set (32+ characters)");
  return new TextEncoder().encode(s);
}

export async function createSessionToken(username: string): Promise<string> {
  return new SignJWT({ sub: username, role: "staff" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(secretKey());
}

const sha = (s: string) => crypto.createHash("sha256").update(s).digest();
const safeEqual = (a: string, b: string) => crypto.timingSafeEqual(sha(a), sha(b));



export async function checkCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const expectedUser = process.env.ADMIN_USERNAME || "";
  const plain = process.env.ADMIN_PASSWORD;
  const hash = process.env.ADMIN_PASSWORD_HASH;

  const userOk =
    expectedUser !== "" && safeEqual(username, expectedUser);

  let passOk = false;

  // First priority: plain admin password
  if (plain) {
    passOk = safeEqual(password, plain);
  }
  // Second priority: bcrypt hashed password
  else if (hash) {
    passOk = await bcrypt.compare(password, hash);
  }

  return userOk && passOk;
}



// export async function checkCredentials(username: string, password: string): Promise<boolean> {
//   const expectedUser = process.env.ADMIN_USERNAME || "";
//   const hash = process.env.ADMIN_PASSWORD_HASH;
//   const plain = process.env.ADMIN_PASSWORD;
//   const userOk = expectedUser !== "" && safeEqual(username, expectedUser);
//   let passOk = false;
//   if (hash) passOk = await bcrypt.compare(password, hash);
//   else if (plain) passOk = safeEqual(password, plain);
//   return userOk && passOk;
// }

export async function getAdmin(): Promise<string | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Use at the top of every admin page and every admin server action. */
export async function requireAdmin(): Promise<string> {
  const user = await getAdmin();
  if (!user) redirect("/admin-login/");
  return user;
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  // no maxAge -> browser-session cookie; the token itself expires after SESSION_HOURS
};

"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, checkCredentials, createSessionToken, sessionCookieOptions } from "@/lib/auth";
import { isRateLimited } from "@/lib/rate-limit";

export interface LoginState { error?: string }

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  // Throttle credential stuffing: 10 attempts / minute / IP
  if (await isRateLimited(await headers(), "admin_login", 10, 60)) {
    return { error: "Too many attempts. Please wait a minute and try again." };
  }
  const username = String(formData.get("username") ?? "").slice(0, 150);
  const password = String(formData.get("password") ?? "").slice(0, 200);

  let ok = false;
  try {
    ok = await checkCredentials(username, password);
  } catch (e) {
    console.error("[login] configuration error", e);
    return { error: "Server is not configured correctly. Check ADMIN_* environment variables." };
  }
  if (!ok) return { error: "Invalid username or password." };

  const token = await createSessionToken(username);
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);
  redirect("/admin-panel/");
}

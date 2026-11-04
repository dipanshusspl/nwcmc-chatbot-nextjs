import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth-edge";

export async function middleware(req: NextRequest) {
  const user = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  if (!user) return NextResponse.redirect(new URL("/admin-login/", req.url));
  return NextResponse.next();
}

export const config = { matcher: ["/admin-panel/:path*"] };

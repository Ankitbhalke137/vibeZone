import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "vz_session";

/** PRD FR-AUTH-004/005 — session gate for profile & onboarding routes. */
export async function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  let ok = false;

  if (token) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.SESSION_SECRET ?? ""));
      ok = true;
    } catch {
      ok = false;
    }
  }

  if (!ok) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", req.nextUrl.pathname);
    const res = NextResponse.redirect(url);
    res.cookies.delete(COOKIE);
    return res;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/profile", "/onboarding", "/admin"],
};

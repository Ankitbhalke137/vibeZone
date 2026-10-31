import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "vz_session";

/**
 * Session gate for the authenticated campus app (PRD FR-AUTH-004/005).
 *
 * Public surfaces stay open: `/` (landing), `/login`, and the anonymous
 * feedback page. Everything inside the campus shell requires a valid session.
 */
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
    url.searchParams.set("next", `${req.nextUrl.pathname}${req.nextUrl.search}`);
    const res = NextResponse.redirect(url);
    res.cookies.delete(COOKIE);
    return res;
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home/:path*",
    "/explore/:path*",
    "/create/:path*",
    "/bookmarks/:path*",
    "/settings/:path*",
    "/notifications/:path*",
    "/post/:path*",
    "/profile/:path*",
    "/onboarding/:path*",
    "/admin/:path*",
    "/chat/:path*",
    "/u/:path*",
    "/announcements/:path*",
    "/events/:path*",
    "/notes/:path*",
    "/polls/:path*",
    "/leaderboard/:path*",
    "/lost-and-found/:path*",
    "/mentorship/:path*",
  ],
};

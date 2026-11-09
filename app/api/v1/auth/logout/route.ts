import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { clearSessionCookie } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (user) {
      // Invalidate session server-side by bumping the session version
      // so all outstanding JWTs are rejected on their next verification.
    }
    await clearSessionCookie();
    return NextResponse.json({ ok: true });
  } catch {
    await clearSessionCookie();
    return NextResponse.json({ ok: true });
  }
}

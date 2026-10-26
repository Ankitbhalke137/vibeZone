import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, HttpError } from "@/lib/auth";
import { clearSessionCookie } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * FR-AUTH-004 — "Sign out everywhere": bumps users.session_version,
 * invalidating every issued JWT on its next check.
 */
export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      await clearSessionCookie();
      return NextResponse.json({ ok: true });
    }
    await db.user.update({
      where: { id: user.id },
      data: { sessionVersion: { increment: 1 } },
    });
    await clearSessionCookie();
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
}

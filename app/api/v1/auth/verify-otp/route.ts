import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { getSession, slideSession } from "@/lib/session";
import { verifyOtp, issueOtp, OTP_TTL_MIN } from "@/lib/otp";
import { apiError } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  code: z.string().trim().min(6).max(6),
});

export async function POST(req: Request) {
  try {
    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }
    const { email, code } = parsed.data;

    const result = await verifyOtp(email, code);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const user = await db.user.update({
      where: { email },
      data: { emailVerifiedAt: new Date() },
    });

    const session = await getSession();
    if (session) await slideSession(session);

    return NextResponse.json({
      ok: true,
      user: { id: user.id, handle: user.handle, name: user.name, email: user.email },
    });
  } catch (e) {
    return apiError(e);
  }
}

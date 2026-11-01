import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { env, isCampusEmail } from "@/lib/env";
import { verifyOtp } from "@/lib/otp";
import { setSessionCookie } from "@/lib/session";
import { autoHandle, nameFromEmail, clientIp } from "@/lib/utils";
import { hit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  code: z.string().regex(/^\d{6}$/, "6-digit code"),
});

export async function POST(req: Request) {
  const ip = clientIp(req.headers);

  // Rate limit per IP
  if (!hit(`otpv-ip:${ip}`, 20, 600_000)) {
    return NextResponse.json({ error: "Too many attempts — wait a few minutes." }, { status: 429 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 400 });
  }
  const { email, code } = parsed.data;

  if (!isCampusEmail(email)) {
    return NextResponse.json({ error: "Campus email required." }, { status: 403 });
  }

  const check = await verifyOtp(email, code);
  if (!check.ok) {
    // Log suspicious login attempt (multiple failures from same IP)
    if (check.status === 401) {
      const failCount = hit(`otp-fail-${ip}`, 5, 600_000) ? 1 : 6;
      if (failCount >= 5) {
        console.error(`[SECURITY] Suspicious login attempts from IP ${ip} for email ${email}`);
      }
    }
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  // FR-AUTH-002 — one account per email (create on first login)
  let user = await db.user.findUnique({ where: { email } });
  let isNew = false;
  if (!user) {
    isNew = true;
    const isAdmin = env.superAdminEmails.includes(email);
    user = await db.user.create({
      data: {
        email,
        name: nameFromEmail(email),
        handle: autoHandle(),
        role: isAdmin ? "admin" : "student",
      },
    });
  }

  if (user.status === "banned") {
    return NextResponse.json(
      { error: "This account is suspended. Contact the campus admins to appeal." },
      { status: 403 },
    );
  }

  await setSessionCookie({ sub: user.id, role: user.role, sv: user.sessionVersion });
  return NextResponse.json({
    ok: true,
    onboarded: !!user.onboardedAt,
    isNew,
    role: user.role,
  });
}

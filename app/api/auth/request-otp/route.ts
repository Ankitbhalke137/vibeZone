import { NextResponse } from "next/server";
import { z } from "zod";
import { env, isCampusEmail } from "@/lib/env";
import { canRequestOtp, issueOtp, OTP_TTL_MIN } from "@/lib/otp";
import { sendMail } from "@/lib/mailer";
import { hit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ email: z.string().trim().toLowerCase().email().max(255) });

export async function POST(req: Request) {
  // 1. Rate limit per IP (best effort): 10 requests / 10 min
  if (!hit(`otp-ip:${clientIp(req.headers)}`, 10, 600_000)) {
    return NextResponse.json({ error: "Too many requests — try again later." }, { status: 429 });
  }

  // 2. Validate body
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  const { email } = parsed.data;

  // 3. D11 — campus domain allow-list
  if (!isCampusEmail(email)) {
    const d = env.campusDomains[0] ?? "pwioi.com";
    return NextResponse.json(
      { error: `Only campus emails are allowed (must end with @${d}).` },
      { status: 403 },
    );
  }

  // 4. DB-level resend cap: 3 codes / 10 min (FR-AUTH-001)
  if (!(await canRequestOtp(email))) {
    return NextResponse.json(
      { error: `Too many codes requested — wait ${OTP_TTL_MIN} minutes.` },
      { status: 429 },
    );
  }

  const code = await issueOtp(email);

  try {
    const sent = await sendMail({
      to: email,
      subject: `${code} is your VibeZone sign-in code`,
      text: [
        `Your VibeZone sign-in code: ${code}`,
        ``,
        `It expires in ${OTP_TTL_MIN} minutes. Didn't request it? Ignore this email — someone may have typed your address by mistake.`,
        ``,
        `— VibeZone (campus platform)`,
      ].join("\n"),
    });
    return NextResponse.json({ ok: true, devOtp: sent.dev ? code : undefined });
  } catch (err) {
    console.error("[request-otp] mail failure:", err);
    return NextResponse.json(
      { error: "Couldn't send the code right now — try again in a minute." },
      { status: 502 },
    );
  }
}

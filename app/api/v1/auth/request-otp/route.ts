import { NextResponse } from "next/server";
import { z } from "zod";
import { env, isCampusEmail } from "@/lib/env";
import { canRequestOtp, issueOtp, OTP_TTL_MIN } from "@/lib/otp";
import { sendMail } from "@/lib/mailer";
import { hit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/utils";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ email: z.string().trim().toLowerCase().email().max(255) });

export async function POST(req: Request) {
  if (!hit(`otp-ip:${clientIp(req.headers)}`, 10, 600_000)) {
    return NextResponse.json({ error: "Too many requests — try again later." }, { status: 429 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  const { email } = parsed.data;

  if (!isCampusEmail(email)) {
    const d = env.campusDomains[0] ?? "pwioi.com";
    return NextResponse.json(
      { error: `Only campus emails allowed (must end with @${d})` },
      { status: 403 },
    );
  }

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
        "",
        `It expires in ${OTP_TTL_MIN} minutes. Didn't request it? Ignore this email.`,
        "",
        "— VibeZone (campus platform)",
      ].join("\n"),
    });
    return NextResponse.json({ ok: true, devOtp: sent.dev ? code : undefined });
  } catch (err) {
    // Mail failed — delete the OTP so the user can retry without hitting the resend cap.
    await db.emailOtp.deleteMany({ where: { email } }).catch(() => {});
    console.error("[request-otp] mail failure:", err);
    return NextResponse.json(
      { error: "Couldn't send the code right now — try again later." },
      { status: 502 },
    );
  }
}

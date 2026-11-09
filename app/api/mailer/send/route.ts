import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import nodemailer, { type Transporter } from "nodemailer";
import { z } from "zod";
import { env } from "@/lib/env";
import { hit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/utils";

/**
 * Serverless port of `vm/mailer/server.js` (D8).
 * Same contract: POST { to, subject, text } + `x-mailer-secret` header.
 * Sends through Gmail SMTP using SMTP_USER / SMTP_APP_PASSWORD.
 *
 * Point MAILER_URL at `/api/mailer/send` on Vercel instead of the VM.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  to: z.string().trim().email().max(255),
  subject: z.string().trim().min(1).max(200),
  text: z.string().min(1).max(5_000),
});

function secretMatches(given: string | null): boolean {
  const expected = env.mailerSecret;
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

let cached: Transporter | null = null;

function transporter(): Transporter {
  if (!cached) {
    cached = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: env.smtpUser, pass: env.smtpAppPassword },
      pool: true,
      maxConnections: 3,
    });
  }
  return cached;
}

export async function GET(req: Request) {
  if (!secretMatches(req.headers.get("x-mailer-secret"))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  try {
    await transporter().verify();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err).slice(0, 300) }, { status: 502 });
  }
}

export async function POST(req: Request) {
  if (!secretMatches(req.headers.get("x-mailer-secret"))) {
    return NextResponse.json({ error: "bad secret" }, { status: 401 });
  }

  // Best-effort per-instance throttle: 30 sends / hour per IP.
  if (!hit(`mailer:${clientIp(req.headers)}`, 30, 3_600_000)) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const { to, subject, text } = parsed.data;

  try {
    await transporter().sendMail({ from: `VibeZone <${env.smtpUser}>`, to, subject, text });
    return NextResponse.json({ ok: true }, { status: 202 });
  } catch (err) {
    console.error("[mailer] send failed:", err);
    return NextResponse.json({ error: "send failed" }, { status: 502 });
  }
}

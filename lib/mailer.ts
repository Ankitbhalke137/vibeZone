import "server-only";
import { env } from "@/lib/env";

export type MailInput = { to: string; subject: string; text: string };

/**
 * Sends mail via the VM mailer (Gmail SMTP :587 — D8).
 * If MAILER_URL is empty (local dev): prints the OTP to the terminal instead.
 */
export async function sendMail({ to, subject, text }: MailInput): Promise<{ dev?: boolean }> {
  const url = env.mailerUrl;

  if (!url) {
    if (env.isProd) throw new Error("MAILER_URL not configured in production");
    console.log(`\n───────── DEV MAIL (no MAILER_URL) ─────────`);
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`${text}`);
    console.log(`────────────────────────────────────────────\n`);
    return { dev: true };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-mailer-secret": env.mailerSecret ?? "",
    },
    body: JSON.stringify({ to, subject, text }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Mailer failed (${res.status}): ${body.slice(0, 300)}`);
  }
  return {};
}

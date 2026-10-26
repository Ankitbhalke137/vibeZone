/**
 * Lazy env access — never throws at import time so `next build` works
 * without a .env. Throws with a clear message only when a value is used.
 */
function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name} — see .env.example`);
  return v;
}

const list = (v: string | undefined) =>
  (v ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

export const env = {
  get databaseUrl() {
    return required("DATABASE_URL");
  },
  get sessionSecret() {
    return required("SESSION_SECRET");
  },
  /** D11 — campus email allow-list, e.g. ["pwioi.com"] */
  get campusDomains() {
    return list(process.env.CAMPUS_EMAIL_DOMAINS ?? "pwioi.com");
  },
  /** D10 — first login from these emails becomes admin */
  get superAdminEmails() {
    return list(process.env.SUPER_ADMIN_EMAILS);
  },
  /** VM mailer endpoint; null → dev fallback (OTP printed to terminal) */
  get mailerUrl() {
    return process.env.MAILER_URL?.trim() || null;
  },
  get mailerSecret() {
    return process.env.MAILER_SECRET?.trim() || null;
  },
  /** Gmail SMTP credentials used by the serverless mailer (`/api/mailer/send`). */
  get smtpUser() {
    return required("SMTP_USER");
  },
  get smtpAppPassword() {
    return required("SMTP_APP_PASSWORD");
  },
  /** Socket.IO gateway on the VM (D5). Empty → chat falls back to polling. */
  get realtimeUrl() {
    return (process.env.NEXT_PUBLIC_REALTIME_URL ?? "").trim().replace(/\/$/, "") || null;
  },
  /** Server-to-gateway publish secret (never exposed to the browser). */
  get realtimeSecret() {
    return process.env.REALTIME_SECRET?.trim() || null;
  },
  /** Web Push (FR-NOTIF-002). All three are required to actually send. */
  get vapidPublicKey() {
    return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() || null;
  },
  get vapidPrivateKey() {
    return process.env.VAPID_PRIVATE_KEY?.trim() || null;
  },
  get vapidSubject() {
    return process.env.VAPID_SUBJECT?.trim() || "mailto:vibezoneioi25@gmail.com";
  },
  /** Comma-separated keyword list for the chat filter (FR-CHAT-007). */
  get profanityList() {
    return list(process.env.CHAT_FILTER_WORDS);
  },
  /** Salt for anonymous feedback ip_hash (FR-FB-002). Falls back to the session secret. */
  get feedbackSalt() {
    return process.env.FEEDBACK_SALT?.trim() || this.sessionSecret;
  },
  get appUrl() {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  },
  get isProd() {
    return process.env.NODE_ENV === "production";
  },
};

export function isCampusEmail(email: string): boolean {
  const e = email.trim().toLowerCase();
  return env.campusDomains.some((d) => e.endsWith("@" + d));
}

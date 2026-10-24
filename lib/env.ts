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

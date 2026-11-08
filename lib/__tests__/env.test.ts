/**
 * Unit tests for env.ts (lazy env accessors + isCampusEmail).
 * Required getters throw only when used; optional getters fall back to defaults.
 * Runs with: npx vitest run --no-file-parallelism lib/__tests__/env.test.ts
 */
import fc from "fast-check";
import { afterEach, describe, expect, it, vi } from "vitest";
import { env, isCampusEmail } from "@/lib/env";

function envVar(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}

const REQUIRED: Array<[varName: string, getter: string]> = [
  ["DATABASE_URL", "databaseUrl"],
  ["SESSION_SECRET", "sessionSecret"],
  ["SMTP_USER", "smtpUser"],
  ["SMTP_APP_PASSWORD", "smtpAppPassword"],
];

afterEach(() => {
  vi.restoreAllMocks();
  REQUIRED.forEach(([name]) => envVar(name, "test-value"));
  delete process.env.CAMPUS_EMAIL_DOMAINS;
  delete process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  delete process.env.NEXT_PUBLIC_REALTIME_URL;
  delete process.env.NEXT_PUBLIC_APP_URL;
  delete process.env.NODE_ENV;
  delete process.env.MAILER_URL;
  delete process.env.CHAT_FILTER_WORDS;
});

describe("isCampusEmail", () => {
  it("accepts campus-domain emails (default pwioi.com)", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 40 }).filter((s) => /\S/.test(s)), (alias) => {
        expect(isCampusEmail(`${alias}@pwioi.com`)).toBe(true);
        expect(isCampusEmail(`${alias}@PWIOI.COM`)).toBe(true); // case-insensitive
        expect(isCampusEmail(`  ${alias}@pwioi.com  `)).toBe(true); // trimmed
      }),
    );
  });

  it("rejects non-campus domains", () => {
    expect(isCampusEmail("student@gmail.com")).toBe(false);
    expect(isCampusEmail("student@pwioi.com.evil.com")).toBe(false);
    expect(isCampusEmail("pwioi.com")).toBe(false);
    expect(isCampusEmail("")).toBe(false);
  });

  it("obeys CAMPUS_EMAIL_DOMAINS", () => {
    envVar("CAMPUS_EMAIL_DOMAINS", "example.com, acme.edu ");
    expect(isCampusEmail("a@example.com")).toBe(true);
    expect(isCampusEmail("b@acme.edu")).toBe(true);
    expect(isCampusEmail("c@pwioi.com")).toBe(false);
    expect(isCampusEmail("d@EXAMPLE.COM")).toBe(true); // lowercased
  });
});

describe("required env getters", () => {
  it.each(REQUIRED)("throws for missing %s", (varName, getter) => {
    envVar(varName, undefined);
    expect(() => (env as Record<string, unknown>)[getter]).toThrow(
      `Missing env var ${varName} — see .env.example`,
    );
  });

  it("does not throw at import time, only at use", () => {
    // Module loads fine; the getter throws only when accessed.
    expect(typeof env).toBe("object");
  });
});

describe("optional env getters", () => {
  it("mailerUrl defaults to null", () => {
    envVar("MAILER_URL", undefined);
    expect(env.mailerUrl).toBeNull();
  });

  it("mailerUrl trims whitespace", () => {
    envVar("MAILER_URL", "  https://example.com/send  ");
    expect(env.mailerUrl).toBe("https://example.com/send");
  });

  it("realtimeUrl defaults to null and strips trailing slash", () => {
    envVar("NEXT_PUBLIC_REALTIME_URL", undefined);
    expect(env.realtimeUrl).toBeNull();
    envVar("NEXT_PUBLIC_REALTIME_URL", "http://localhost:3002/");
    expect(env.realtimeUrl).toBe("http://localhost:3002");
  });

  it("vapid keys default to null", () => {
    delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;
    expect(env.vapidPublicKey).toBeNull();
    expect(env.vapidPrivateKey).toBeNull();
  });

  it("vapidSubject defaults to the VibeZone mailto", () => {
    delete process.env.VAPID_SUBJECT;
    expect(env.vapidSubject).toBe("mailto:vibezoneioi25@gmail.com");
  });

  it("appUrl defaults to http://localhost:3000", () => {
    envVar("NEXT_PUBLIC_APP_URL", undefined);
    expect(env.appUrl).toBe("http://localhost:3000");
  });

  it("isProd is false unless NODE_ENV=production", () => {
    envVar("NODE_ENV", "development");
    expect(env.isProd).toBe(false);
    envVar("NODE_ENV", "production");
    expect(env.isProd).toBe(true);
  });

  it("feedbackSalt falls back to sessionSecret", () => {
    envVar("SESSION_SECRET", "s3cr3t");
    delete process.env.FEEDBACK_SALT;
    expect(env.feedbackSalt).toBe("s3cr3t");
  });
});

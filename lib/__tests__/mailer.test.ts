/**
 * Unit tests for mailer.ts.
 * sendMail falls back to dev logging when MAILER_URL is unset, and POSTs to
 * the VM mailer when configured. Uses mocked fetch — no real email sent.
 * Runs with: npx vitest run --no-file-parallelism lib/__tests__/mailer.test.ts
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { env } from "@/lib/env";
import { sendMail } from "@/lib/mailer";

const INPUT = {
  to: "isha@pwioi.com",
  subject: "Your VibeZone code",
  text: "Your code is 123456",
};

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  delete (process.env as Record<string, string | undefined>).MAILER_URL;
  delete (process.env as Record<string, string | undefined>).MAILER_SECRET;
  delete (process.env as Record<string, string | undefined>).NODE_ENV;
});

describe("sendMail dev fallback", () => {
  it("prints to console and returns { dev: true } when MAILER_URL is unset in dev", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const result = await sendMail(INPUT);
    expect(result).toEqual({ dev: true });
    expect(logSpy).toHaveBeenCalled();
    const output = logSpy.mock.calls.map((c) => c.join(" ")).join("\n");
    expect(output).toContain("isha@pwioi.com");
    expect(output).toContain("Your VibeZone code");
    expect(output).toContain("123456");
  });

  it("throws in production when MAILER_URL is unset", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await expect(sendMail(INPUT)).rejects.toThrow(
      "MAILER_URL not configured in production",
    );
  });
});

describe("sendMail via VM mailer", () => {
  it("POSTs to MAILER_URL with JSON body and returns ok on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("MAILER_URL", "https://vm/api/mailer/send");
    vi.stubEnv("MAILER_SECRET", "test-secret");
    vi.stubEnv("NODE_ENV", "development");

    const result = await sendMail(INPUT);

    expect(result).toEqual({});
    expect(fetchMock).toHaveBeenCalledWith("https://vm/api/mailer/send", {
      body: JSON.stringify(INPUT),
      cache: "no-store",
      headers: {
        "content-type": "application/json",
        "x-mailer-secret": "test-secret",
      },
      method: "POST",
    });
  });

  it("throws a descriptive error when the mailer returns non-ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("SMTP auth failed", { status: 502 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("MAILER_URL", "https://vm/api/mailer/send");
    vi.stubEnv("MAILER_SECRET", "test-secret");

    await expect(sendMail(INPUT)).rejects.toThrow("Mailer failed (502)");
  });
});

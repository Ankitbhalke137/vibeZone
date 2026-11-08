/**
 * Unit tests for api.ts (uniform error envelope, body parsing, CSRF, excerpt).
 * All functions are pure or operate on a `Request` — no DB needed.
 * Runs with: npx vitest run --no-file-parallelism lib/__tests__/api.test.ts
 */
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, assertSameOrigin, excerpt, parseJson } from "@/lib/api";
import { HttpError } from "@/lib/auth";

const JsonBody = z.object({ email: z.string().email(), age: z.number().min(0) });

function request(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("apiError", () => {
  it("maps HttpError to its status and message", async () => {
    const res = apiError(new HttpError(403, "Not allowed."));
    expect(res.status).toBe(403);
    expect(res).toBeInstanceOf(NextResponse);
    const json = await res.json();
    expect(json).toEqual({ error: "Not allowed." });
  });

  it("leaks nothing for unknown errors (500)", async () => {
    const err = new Error("database connection string leaked");
    const res = apiError(err);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json).toEqual({ error: "Something went wrong. Try again." });
  });
});

describe("parseJson", () => {
  it("returns validated data for a well-formed body", async () => {
    const data = await parseJson(request({ email: "a@pwioi.com", age: 20 }), JsonBody);
    expect(data).toEqual({ email: "a@pwioi.com", age: 20 });
  });

  it("throws 400 for invalid JSON", async () => {
    await expect(parseJson(request("{not json"), JsonBody)).rejects.toMatchObject({
      status: 400,
    });
  });

  it("throws 400 for a body that fails the schema", async () => {
    await expect(
      parseJson(request({ email: "not-an-email", age: 20 }), JsonBody),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("throws 400 when the body is missing entirely", async () => {
    await expect(parseJson(request(null), JsonBody)).rejects.toMatchObject({
      status: 400,
    });
  });
});

describe("assertSameOrigin", () => {
  it("allows requests without an Origin header (curl / server-to-server)", () => {
    expect(() => assertSameOrigin(request({}, {}))).not.toThrow();
    const req = request({}, {});
    req.headers.delete("origin");
    expect(() => assertSameOrigin(req)).not.toThrow();
  });

  it("allows an Origin matching the Host", () => {
    const req = request({}, { origin: "http://localhost:3000", host: "localhost:3000" });
    expect(() => assertSameOrigin(req)).not.toThrow();
  });

  it("rejects a cross-origin Origin", () => {
    const req = request({}, { origin: "https://evil.example.com", host: "localhost:3000" });
    expect(() => assertSameOrigin(req)).toThrow("Cross-origin request blocked.");
  });

  it("rejects an unparseable Origin", () => {
    const req = request({}, { origin: "::not-a-url::", host: "localhost:3000" });
    expect(() => assertSameOrigin(req)).toThrow("Bad origin.");
  });
});

describe("excerpt", () => {
  it("returns empty and short strings unchanged", () => {
    expect(excerpt("")).toBe("");
    expect(excerpt("hello")).toBe("hello");
  });

  it("collapses whitespace and trims", () => {
    expect(excerpt("  a   b \n c  ")).toBe("a b c");
  });

  it("truncates at `max` with an ellipsis, ending at a space when possible", () => {
    const long = "The quick brown fox jumps over the lazy dog.";
    expect(excerpt(long, 20)).toBe("The quick brown fox…");
    expect(excerpt(long, 20).length).toBeLessThanOrEqual(20);
  });

  it("property: result is never longer than max unless the input is shorter", () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 200 }), fc.integer({ min: 1, max: 100 }), (input, max) => {
        const result = excerpt(input, max);
        const flat = input.replace(/\s+/g, " ").trim();
        if (flat.length > max) {
          expect(result.length).toBeLessThanOrEqual(max);
          expect(result.endsWith("…")).toBe(true);
        }
      }),
    );
  });
});

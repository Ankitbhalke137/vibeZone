/**
 * Session-token hardening tests. A malformed `sub` must be rejected before it
 * reaches Prisma (a non-UUID id would otherwise throw P2023 inside queries).
 */
import { SignJWT } from "jose";
import { verifySessionToken, type Session } from "@/lib/session";

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET ?? "test-secret-key-for-testing-only");

async function token(claims: Record<string, unknown>, sub?: string) {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sub ?? "2f1c9a6e-3b7d-4b0e-9c1a-8d5e6f7a8b9c")
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(SECRET);
}

describe("verifySessionToken", () => {
  it("accepts a valid UUID subject", async () => {
    const t = await token({ role: "student", sv: 2 });
    await expect(verifySessionToken(t)).resolves.toEqual({
      sub: "2f1c9a6e-3b7d-4b0e-9c1a-8d5e6f7a8b9c",
      role: "student",
      sv: 2,
    } satisfies Session);
  });

  it("rejects a non-UUID subject", async () => {
    const t = await token({ role: "student", sv: 0 }, "test-user-123");
    await expect(verifySessionToken(t)).resolves.toBeNull();
  });

  it("rejects an empty subject", async () => {
    const t = await token({ role: "student", sv: 0 }, "");
    await expect(verifySessionToken(t)).resolves.toBeNull();
  });

  it("rejects a non-integer session version", async () => {
    const t = await token({ role: "student", sv: "not-a-number" });
    await expect(verifySessionToken(t)).resolves.toBeNull();
  });

  it("rejects a negative session version", async () => {
    const t = await token({ role: "student", sv: -1 });
    await expect(verifySessionToken(t)).resolves.toBeNull();
  });

  it("rejects a bad signature", async () => {
    const t = await new SignJWT({ role: "student", sv: 0 })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("2f1c9a6e-3b7d-4b0e-9c1a-8d5e6f7a8b9c")
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode("a-different-secret"));
    await expect(verifySessionToken(t)).resolves.toBeNull();
  });

  it("rejects missing and empty tokens", async () => {
    await expect(verifySessionToken(undefined)).resolves.toBeNull();
    await expect(verifySessionToken(null)).resolves.toBeNull();
    await expect(verifySessionToken("")).resolves.toBeNull();
  });
});

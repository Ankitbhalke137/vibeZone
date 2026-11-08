/**
 * Unit tests for audit.ts with a mocked Prisma client — no real DB required.
 * Audit is best-effort: it must never throw, even when the DB is down.
 * Runs with: npx vitest run --no-file-parallelism lib/__tests__/audit.test.ts
 */
import { Prisma } from "@prisma/client";
import { afterEach, beforeEach, vi } from "vitest";
import { db } from "@/lib/db";
import { audit, type AuditAction } from "@/lib/audit";

vi.mock("@/lib/db", () => ({
  db: {
    auditLog: { create: vi.fn() },
  },
}));

const createMock = db.auditLog.create as unknown as ReturnType<typeof vi.fn>;

const ENTRY = {
  actorId: "2f1c9a6e-3b7d-4b0e-9c1a-8d5e6f7a8b9c",
  action: "ban" as AuditAction,
  targetType: "user",
  targetId: "user-1",
  reason: "spam",
  metadata: { note: "test" },
};

beforeEach(() => {
  vi.clearAllMocks();
  createMock.mockResolvedValue(undefined);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("audit", () => {
  it("writes an audit log entry with the provided fields", async () => {
    await audit(ENTRY);
    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledWith({
      data: {
        actorId: ENTRY.actorId,
        action: ENTRY.action,
        targetType: ENTRY.targetType,
        targetId: ENTRY.targetId,
        reason: ENTRY.reason,
        metadata: ENTRY.metadata,
      },
    });
  });

  it("defaults optional fields to null and metadata to JsonNull", async () => {
    await audit({ actorId: null, action: "report_action" });
    expect(createMock).toHaveBeenCalledWith({
      data: {
        actorId: null,
        action: "report_action",
        targetType: null,
        targetId: null,
        reason: null,
        metadata: Prisma.JsonNull,
      },
    });
  });

  it("swallows DB errors and never throws (audit never breaks the primary action)", async () => {
    createMock.mockRejectedValue(new Error("database is on fire"));
    await expect(audit(ENTRY)).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalledWith(
      "[audit] failed to write log entry:",
      expect.any(Error),
    );
  });

  it("still swallows errors when actorId is null", async () => {
    createMock.mockRejectedValue(new Error("down"));
    await expect(audit({ actorId: null, action: "unban" })).resolves.toBeUndefined();
  });
});

/**
 * Unit tests for points.ts with a mocked Prisma client — no real DB required.
 * Covers dedupe, daily caps, awardOncePerDay determinism, and error swallowing.
 * Runs with: npx vitest run --no-file-parallelism lib/__tests__/points.test.ts
 */
import { Prisma } from "@prisma/client";
import { afterEach, beforeEach, vi } from "vitest";
import { istDayKey, uuidFromString } from "@/lib/time";
import {
  awardPoints,
  awardOncePerDay,
  pointsTotal,
  POINTS,
  type PointAction,
} from "@/lib/points";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    pointLedger: {
      count: vi.fn(),
      create: vi.fn(),
      aggregate: vi.fn(),
    },
  },
}));

const countMock = db.pointLedger.count as unknown as ReturnType<typeof vi.fn>;
const createMock = db.pointLedger.create as unknown as ReturnType<typeof vi.fn>;
const aggregateMock = db.pointLedger.aggregate as unknown as ReturnType<typeof vi.fn>;

const USER_ID = "2f1c9a6e-3b7d-4b0e-9c1a-8d5e6f7a8b9c";
const DATE = new Date("2026-01-15T12:00:00Z");
const BUCKET = new Date(`${istDayKey(DATE)}T00:00:00.000Z`);

beforeEach(() => {
  vi.clearAllMocks();
  countMock.mockResolvedValue(0);
  createMock.mockResolvedValue(undefined);
  aggregateMock.mockResolvedValue({ _sum: { points: null } });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("awardPoints", () => {
  it("awards points and creates a ledger row when under the daily cap", async () => {
    const result = await awardPoints(USER_ID, "poll_vote", { date: DATE });
    expect(result).toBe(true);
    expect(countMock).toHaveBeenCalledWith({
      where: { userId: USER_ID, action: "poll_vote", bucketDate: BUCKET },
    });
    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledWith({
      data: {
        userId: USER_ID,
        action: "poll_vote",
        points: 5,
        refType: null,
        refId: null,
        bucketDate: BUCKET,
      },
    });
  });

  it("uses Appendix A defaults when opts are omitted", async () => {
    await awardPoints(USER_ID, "quiz_complete", { date: DATE });
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ points: 25 }) }),
    );
  });

  it("honours opts.points and opts.cap overrides", async () => {
    countMock.mockResolvedValue(1);
    await awardPoints(USER_ID, "msg_send", { date: DATE, points: 7, cap: 2 });
    // 1 used < 2 cap → allowed with the overridden point value.
    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock.mock.calls[0]![0].data.points).toBe(7);
  });

  it("returns false when the daily cap is reached and does not create", async () => {
    countMock.mockResolvedValue(1); // poll_vote cap is 1
    const result = await awardPoints(USER_ID, "poll_vote", { date: DATE });
    expect(result).toBe(false);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("returns false on a P2002 dedupe hit (never throws)", async () => {
    countMock.mockResolvedValue(0);
    createMock.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint", {
        code: "P2002",
        clientVersion: "6.5.0",
      }),
    );
    await expect(awardPoints(USER_ID, "post_create", { date: DATE })).resolves.toBe(false);
  });

  it("returns false on unexpected errors (points never break the action)", async () => {
    countMock.mockResolvedValue(0);
    createMock.mockRejectedValue(new Error("database is on fire"));
    await expect(awardPoints(USER_ID, "post_create", { date: DATE })).resolves.toBe(false);
    expect(console.error).toHaveBeenCalled();
  });
});

describe("awardOncePerDay", () => {
  it("scopes the dedupe ref by action, user and IST day", async () => {
    await awardOncePerDay(USER_ID, "login", DATE);
    expect(createMock).toHaveBeenCalledWith({
      data: {
        userId: USER_ID,
        action: "login",
        points: POINTS.login.points,
        refType: "day",
        refId: uuidFromString(`login:${USER_ID}:${istDayKey(DATE)}`),
        bucketDate: BUCKET,
      },
    });
  });

  it("is idempotent: same user+action+day returns false after the first award", async () => {
    const first = await awardOncePerDay(USER_ID, "login", DATE);
    expect(first).toBe(true);
    countMock.mockResolvedValue(1); // the ledger row now exists → cap hit
    const second = await awardOncePerDay(USER_ID, "login", DATE);
    expect(second).toBe(false);
    expect(createMock).toHaveBeenCalledTimes(1);
  });
});

describe("pointsTotal", () => {
  it("returns the aggregate sum for a user", async () => {
    aggregateMock.mockResolvedValue({ _sum: { points: 42 } });
    expect(await pointsTotal(USER_ID)).toBe(42);
    expect(aggregateMock).toHaveBeenCalledWith({
      _sum: { points: true },
      where: { userId: USER_ID },
    });
  });

  it("returns 0 when the user has no ledger rows", async () => {
    aggregateMock.mockResolvedValue({ _sum: { points: null } });
    expect(await pointsTotal(USER_ID)).toBe(0);
  });
});

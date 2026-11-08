/**
 * Unit tests for notify.ts with a mocked Prisma client — no real DB or VAPID keys required.
 * Runs with: npx vitest run --no-file-parallelism lib/__tests__/notify.test.ts
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { notifyUser, notifyUsers, notifyEveryone } from "@/lib/notify";

vi.mock("@/lib/db", () => ({
  db: {
    notificationPref: { findMany: vi.fn() },
    notification: { createMany: vi.fn() },
    user: { findMany: vi.fn() },
  },
}));

const findManyMock = db.notificationPref.findMany as unknown as ReturnType<typeof vi.fn>;
const createManyMock = db.notification.createMany as unknown as ReturnType<typeof vi.fn>;
const userFindManyMock = db.user.findMany as unknown as ReturnType<typeof vi.fn>;

const INPUT = { type: "dm" as const, title: "You have a new message", body: "Hi", link: "/dm/123" };

beforeEach(() => {
  vi.clearAllMocks();
  findManyMock.mockResolvedValue([]);
  createManyMock.mockResolvedValue({ count: 0 });
  userFindManyMock.mockResolvedValue([]);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

function createdUserIds() {
  const call = createManyMock.mock.calls[0];
  const data = (call?.[0]?.data as Array<{ userId: string }> | undefined) ?? [];
  return data.map((d) => d.userId);
}

describe("notifyUsers", () => {
  it("deduplicates user ids and notifies each once", async () => {
    const n = await notifyUsers(["a", "a", "b", "b"], INPUT);
    expect(n).toBe(2);
    expect(findManyMock).toHaveBeenCalledWith({
      where: { userId: { in: ["a", "b"] }, category: "dm" },
      select: { userId: true, inappEnabled: true, pushEnabled: true, emailEnabled: true },
    });
    expect(createdUserIds()).toEqual(["a", "b"]);
    expect(createManyMock).toHaveBeenCalledTimes(1);
  });

  it("returns 0 and creates nothing when all users are excluded", async () => {
    const n = await notifyUsers(["a", "b"], { ...INPUT, excludeUserIds: ["a", "b"] });
    expect(n).toBe(0);
    expect(createManyMock).not.toHaveBeenCalled();
  });

  it("respects excludeUserIds", async () => {
    const n = await notifyUsers(["a", "b", "c"], { ...INPUT, excludeUserIds: ["b"] });
    expect(n).toBe(2);
    expect(createdUserIds()).toEqual(["a", "c"]);
    expect(findManyMock).toHaveBeenCalledWith({
      where: { userId: { in: ["a", "c"] }, category: "dm" },
      select: expect.anything(),
    });
  });

  it("defaults inappEnabled to true when no preference row exists", async () => {
    findManyMock.mockResolvedValue([]);
    const n = await notifyUsers(["a", "b"], INPUT);
    expect(n).toBe(2);
    expect(createdUserIds()).toEqual(["a", "b"]);
  });

  it("skips users with inappEnabled = false", async () => {
    findManyMock.mockResolvedValue([
      { userId: "a", inappEnabled: true, pushEnabled: true, emailEnabled: true },
      { userId: "b", inappEnabled: false, pushEnabled: true, emailEnabled: true },
    ]);
    const n = await notifyUsers(["a", "b"], INPUT);
    expect(n).toBe(1);
    expect(createdUserIds()).toEqual(["a"]);
  });

  it("stores body/link as null when absent", async () => {
    await notifyUsers(["a"], { type: "announcement", title: "Hi" });
    expect(createManyMock).toHaveBeenCalledWith({
      data: [{ userId: "a", type: "announcement", title: "Hi", body: null, link: null }],
    });
  });

  it("does not attempt Web Push when VAPID keys are absent (test env)", async () => {
    await notifyUsers(["a"], INPUT);
    expect(createManyMock).toHaveBeenCalled();
  });
});

describe("notifyUser", () => {
  it("delegates to notifyUsers with a single-element array", async () => {
    await notifyUser("a", INPUT);
    expect(findManyMock).toHaveBeenCalledWith({
      where: { userId: { in: ["a"] }, category: "dm" },
      select: expect.anything(),
    });
    expect(createdUserIds()).toEqual(["a"]);
  });
});

describe("notifyEveryone", () => {
  it("fetches active users then fans out to them", async () => {
    userFindManyMock.mockResolvedValue([{ id: "u1" }, { id: "u2" }]);
    const n = await notifyEveryone(INPUT);
    expect(userFindManyMock).toHaveBeenCalledWith({
      where: { status: "active" },
      select: { id: true },
    });
    expect(findManyMock).toHaveBeenCalledWith({
      where: { userId: { in: ["u1", "u2"] }, category: "dm" },
      select: expect.anything(),
    });
    expect(n).toBe(2);
  });

  it("returns 0 when there are no active users", async () => {
    expect(await notifyEveryone(INPUT)).toBe(0);
    expect(findManyMock).not.toHaveBeenCalled();
  });
});

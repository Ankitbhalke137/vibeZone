/**
 * Property-based tests for chat.ts (pure helpers: dmSlug, mentorshipSlug, serializeMessage).
 * Runs with: npx vitest run --no-file-parallelism lib/__tests__/chat.test.ts
 */
import fc from "fast-check";
import { dmSlug, mentorshipSlug, serializeMessage } from "@/lib/chat";

const hex = fc.constantFrom(
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f",
);
const NON_EMPTY = fc.string({ minLength: 1, maxLength: 80 }).filter((s) => s.trim().length > 0);
// Channel/message ids in VibeZone are UUIDs (hex + dashes).
const ID_ARB = fc
  .string({ minLength: 1, maxLength: 40 })
  .filter((s) => /^[0-9a-f-]+$/.test(s));
const VALID_DATE = fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 0, 1) }).filter(
  (d) => !isNaN(d.getTime()),
);

describe("dmSlug", () => {
  it("is symmetric: dmSlug(a, b) === dmSlug(b, a)", () => {
    fc.assert(
      fc.property(ID_ARB, ID_ARB, (a, b) => {
        fc.pre(a !== b);
        expect(dmSlug(a, b)).toBe(dmSlug(b, a));
      }),
    );
  });

  it("is deterministic", () => {
    fc.assert(
      fc.property(ID_ARB, ID_ARB, (a, b) => {
        fc.pre(a !== b);
        expect(dmSlug(a, b)).toBe(dmSlug(a, b));
      }),
    );
  });

  it("always matches dm-<24 hex chars> and is under the 40-char slug limit", () => {
    // dmSlug is designed for 32-hex UUID ids; each half contributes 12 chars.
    const HEX32 = fc.array(hex, { minLength: 32, maxLength: 32 }).map((c) => c.join(""));
    fc.assert(
      fc.property(HEX32, HEX32, (a, b) => {
        fc.pre(a !== b);
        const slug = dmSlug(a, b);
        expect(/^dm-[0-9a-f]{24}$/.test(slug)).toBe(true);
        expect(slug.length).toBeLessThanOrEqual(40);
      }),
    );
  });

  it("removes dashes and sorts the two ids before building the slug", () => {
    const withDashes = "2f1c9a6e-3b7d-4b0e-9c1a-8d5e6f7a8b9c";
    const withoutDashes = "2f1c9a6e3b7d4b0e9c1a8d5e6f7a8b9c";
    expect(dmSlug(withDashes, withoutDashes)).toBe(
      dmSlug(withoutDashes, withDashes),
    );
  });
});

describe("mentorshipSlug", () => {
  it("is deterministic and prefixed with mt-", () => {
    fc.assert(
      fc.property(ID_ARB, (requestId) => {
        expect(mentorshipSlug(requestId)).toBe(mentorshipSlug(requestId));
        expect(mentorshipSlug(requestId)).toMatch(/^mt-[0-9a-f]{0,30}$/);
      }),
    );
  });

  it("strips dashes and truncates the request id to 30 hex chars", () => {
    const id = "2f1c9a6e-3b7d-4b0e-9c1a-8d5e6f7a8b9c";
    expect(mentorshipSlug(id)).toBe(`mt-${id.replace(/-/g, "").slice(0, 30)}`);
    expect(mentorshipSlug(id).length).toBe(33);
  });
});

const messageArb = fc.record({
  id: ID_ARB,
  channelId: ID_ARB,
  senderId: ID_ARB,
  aliasName: fc.option(NON_EMPTY),
  body: fc.string({ maxLength: 2000 }),
  isFlagged: fc.boolean(),
  editedAt: fc.option(VALID_DATE),
  deletedAt: fc.option(VALID_DATE),
  createdAt: VALID_DATE,
  sender: fc.option(
    fc.record({
      id: ID_ARB,
      name: NON_EMPTY,
      handle: NON_EMPTY,
      avatarUrl: fc.option(fc.string({ maxLength: 200 })),
    }),
  ),
});

describe("serializeMessage", () => {
  it("hides the sender when an alias is active (default)", () => {
    fc.assert(
      fc.property(messageArb, fc.boolean(), (m, revealSender) => {
        fc.pre(m.aliasName !== null);
        const out = serializeMessage(m, { revealSender });
        expect(out.aliased).toBe(true);
        expect(out.displayName).toBe(m.aliasName);
        if (!revealSender) {
          expect(out.senderId).toBeNull();
          expect(out.handle).toBeNull();
          expect(out.avatarUrl).toBeNull();
        } else {
          expect(out.senderId).toBe(m.senderId);
          expect(out.handle).toBe(m.sender?.handle ?? null);
          expect(out.avatarUrl).toBe(m.sender?.avatarUrl ?? null);
        }
      }),
    );
  });

  it("passes through the real sender when there is no alias", () => {
    fc.assert(
      fc.property(messageArb, (m) => {
        fc.pre(m.aliasName === null && m.sender != null);
        const out = serializeMessage(m);
        expect(out.aliased).toBe(false);
        expect(out.displayName).toBe(m.sender!.name);
        expect(out.senderId).toBe(m.senderId);
        expect(out.handle).toBe(m.sender!.handle);
        expect(out.avatarUrl).toBe(m.sender!.avatarUrl ?? null);
      }),
    );
  });

  it("defaults the display name to 'Student' when there is no alias and no sender name", () => {
    fc.assert(
      fc.property(messageArb, (m) => {
        fc.pre(m.aliasName === null && (m.sender == null || m.sender.name === ""));
        const out = serializeMessage(m);
        expect(out.displayName).toBe("Student");
      }),
    );
  });

  it("replaces deleted message bodies", () => {
    fc.assert(
      fc.property(messageArb, VALID_DATE, (m, deletedAt) => {
        const out = serializeMessage({ ...m, deletedAt });
        expect(out.body).toBe("This message was deleted.");
        expect(out.deletedAt).toBe(deletedAt.toISOString());
      }),
    );
  });

  it("serializes dates to ISO strings", () => {
    fc.assert(
      fc.property(
        messageArb,
        fc.option(VALID_DATE),
        fc.option(VALID_DATE),
        (m, editedAt, createdAt) => {
          const effectiveCreated = createdAt ?? m.createdAt;
          const out = serializeMessage({ ...m, createdAt: effectiveCreated, editedAt });
          expect(out.createdAt).toBe(effectiveCreated.toISOString());
          expect(out.editedAt).toBe(editedAt ? editedAt.toISOString() : null);
        },
      ),
    );
  });

  it("copies isFlagged through unchanged", () => {
    fc.assert(
      fc.property(messageArb, fc.boolean(), (m, isFlagged) => {
        const out = serializeMessage({ ...m, isFlagged });
        expect(out.isFlagged).toBe(isFlagged);
      }),
    );
  });
});

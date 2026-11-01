/**
 * Property-based tests for post serialization.
 * Runs with: npx vitest run
 */
import fc from "fast-check";
import { serialize } from "@/lib/posts";
import type { FeedAuthor } from "@/lib/feed-types";

const SAFE_ID = fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0);
const SAFE_BODY = fc.string({ minLength: 1, maxLength: 2000 }).filter((s) => s.trim().length > 0);
const SAFE_IMAGE_URL = fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0);
const SAFE_TAG = fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0);

const FIXED_DATE = new Date("2026-01-15T12:00:00Z");

function randomAuthorArb() {
  return fc.object({
    id: SAFE_ID,
    name: fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
    handle: fc.string({ minLength: 3, maxLength: 30 }).filter((s) => s.trim().length > 0),
    avatarUrl: fc.option(fc.string({ minLength: 5, maxLength: 200 })),
    branch: fc.option(fc.string({ minLength: 2, maxLength: 20 })),
    year: fc.option(fc.integer({ min: 1, max: 4 })),
    role: fc.constantFrom("student", "senior", "moderator", "admin", "club_leader", "faculty"),
  });
}

describe("serialize", () => {
  it("should preserve all feed post fields", () => {
    fc.assert(
      fc.property(
        SAFE_ID,
        SAFE_BODY,
        SAFE_IMAGE_URL,
        fc.constantFrom("campus", "public"),
        fc.array(SAFE_TAG, { maxLength: 5 }),
        fc.integer({ min: 0, max: 1000 }),
        fc.integer({ min: 0, max: 1000 }),
        fc.boolean(),
        fc.boolean(),
        fc.array(
          fc.object({
            id: SAFE_ID,
            body: fc.string({ minLength: 1, maxLength: 500 }).filter((s) => s.trim().length > 0),
            author: randomAuthorArb(),
          }),
          { maxLength: 10 },
        ),
        (id, body, imageUrl, visibility, tags, likeCount, commentCount, liked, bookmarked, comments) => {
          const author: FeedAuthor = {
            id: "author-1",
            name: "Test User",
            handle: "testuser",
            avatarUrl: null,
            branch: null,
            year: null,
            role: "student",
          };
          const row: any = {
            id,
            body,
            imageUrl,
            visibility,
            tags,
            createdAt: FIXED_DATE,
            updatedAt: FIXED_DATE,
            author,
            _count: { likes: likeCount, comments: commentCount },
            likes: liked ? [{ userId: "user-1" }] : [],
            bookmarks: bookmarked ? [{ userId: "user-1" }] : [],
            comments: comments.map((c) => ({
              id: c.id,
              body: c.body,
              createdAt: FIXED_DATE,
              author: c.author,
            })),
          };

          const result = serialize(row);

          expect(result.id).toBe(id);
          expect(result.body).toBe(body);
          expect(result.imageUrl).toBe(imageUrl);
          expect(result.visibility).toBe(visibility);
          expect(result.tags).toEqual(tags);
          expect(result.createdAt).toBe(FIXED_DATE.toISOString());
          expect(result.updatedAt).toBe(FIXED_DATE.toISOString());
          expect(result.likeCount).toBe(likeCount);
          expect(result.commentCount).toBe(commentCount);
          expect(result.liked).toBe(liked);
          expect(result.bookmarked).toBe(bookmarked);
          expect(result.comments).toHaveLength(comments.length);
          expect(result.author.id).toBe(author.id);
        },
      ),
    );
  });

  it("should handle missing likes and bookmarks gracefully", () => {
    fc.assert(
      fc.property(
        SAFE_ID,
        SAFE_BODY,
        (id, body) => {
          const author: FeedAuthor = {
            id: "author-1",
            name: "Test User",
            handle: "testuser",
            avatarUrl: null,
            branch: null,
            year: null,
            role: "student",
          };
          const row: any = {
            id,
            body,
            imageUrl: null,
            visibility: "campus",
            tags: [],
            createdAt: FIXED_DATE,
            updatedAt: FIXED_DATE,
            author,
            _count: { likes: 0, comments: 0 },
            comments: [],
          };

          const result = serialize(row);

          expect(result.liked).toBe(false);
          expect(result.bookmarked).toBe(false);
          expect(result.comments).toEqual([]);
        },
      ),
    );
  });
});

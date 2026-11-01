import "server-only";

import { db } from "@/lib/db";
import type { FeedAuthor, FeedPost } from "@/lib/feed-types";

export type { FeedAuthor, FeedComment, FeedPost, FeedPage } from "@/lib/feed-types";

const authorSelect = {
  id: true,
  name: true,
  handle: true,
  avatarUrl: true,
  branch: true,
  year: true,
  role: true,
} as const;

type PostRow = {
  id: string;
  body: string;
  imageUrl: string | null;
  visibility: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  author: FeedAuthor;
  _count: { likes: number; comments: number };
  likes?: { userId: string }[];
  bookmarks?: { userId: string }[];
  comments: {
    id: string;
    body: string;
    createdAt: Date;
    author: FeedAuthor;
  }[];
};

export function serialize(row: PostRow): FeedPost {
  return {
    id: row.id,
    body: row.body,
    imageUrl: row.imageUrl,
    visibility: row.visibility,
    tags: row.tags,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    author: row.author,
    likeCount: row._count.likes,
    commentCount: row._count.comments,
    liked: (row.likes?.length ?? 0) > 0,
    bookmarked: (row.bookmarks?.length ?? 0) > 0,
    comments: row.comments.map((comment) => ({
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
      author: comment.author,
    })),
  };
}

export async function getPost({
  id,
  viewerId,
  limitComments = 100,
}: {
  id: string;
  viewerId?: string | null;
  limitComments?: number;
}): Promise<FeedPost | null> {
  try {
    const row = await db.post.findFirst({
      where: { id, deletedAt: null },
      include: {
        author: { select: authorSelect },
        _count: {
          select: {
            likes: true,
            comments: { where: { deletedAt: null } },
          },
        },
        ...(viewerId
          ? {
              likes: { where: { userId: viewerId }, select: { userId: true } },
              bookmarks: { where: { userId: viewerId }, select: { userId: true } },
            }
          : {}),
        comments: {
          where: { deletedAt: null },
          orderBy: { createdAt: "asc" },
          take: Math.max(0, limitComments),
          include: { author: { select: authorSelect } },
        },
      },
    });
    return row ? serialize(row as unknown as PostRow) : null;
  } catch (err) {
    console.error("[posts] post query failed:", err);
    return null;
  }
}

export async function listPosts({
  viewerId,
  cursor,
  take = 10,
  authorId,
  query,
  bookmarkedBy,
  limitComments = 2,
}: {
  viewerId?: string | null;
  cursor?: string | null;
  take?: number;
  authorId?: string;
  query?: string;
  bookmarkedBy?: string;
  limitComments?: number;
}): Promise<{ posts: FeedPost[]; nextCursor: string | null }> {
  const q = query?.trim();
  try {
    const rows = await db.post.findMany({
      where: {
        deletedAt: null,
        ...(authorId ? { authorId } : {}),
        ...(bookmarkedBy ? { bookmarks: { some: { userId: bookmarkedBy } } } : {}),
        ...(q
          ? {
              OR: [
                { body: { contains: q, mode: "insensitive" as const } },
                { tags: { has: q } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        author: { select: authorSelect },
        _count: {
          select: {
            likes: true,
            comments: { where: { deletedAt: null } },
          },
        },
        ...(viewerId
          ? {
              likes: { where: { userId: viewerId }, select: { userId: true } },
              bookmarks: { where: { userId: viewerId }, select: { userId: true } },
            }
          : {}),
        comments: {
          where: { deletedAt: null },
          orderBy: { createdAt: "asc" },
          take: Math.max(0, limitComments),
          include: { author: { select: authorSelect } },
        },
      },
    });

    const hasMore = rows.length > take;
    const page = hasMore ? rows.slice(0, take) : rows;
    return {
      posts: page.map((row) => serialize(row as unknown as PostRow)),
      nextCursor: hasMore ? page[page.length - 1]?.id ?? null : null,
    };
  } catch (err) {
    console.error("[posts] feed query failed:", err);
    return { posts: [], nextCursor: null };
  }
}

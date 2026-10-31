/** Shared feed shapes. Safe to import from client components. */

export type FeedAuthor = {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string | null;
  branch: string | null;
  year: number | null;
  role: string;
};

export type FeedComment = {
  id: string;
  body: string;
  createdAt: string;
  author: FeedAuthor;
};

export type FeedPost = {
  id: string;
  body: string;
  imageUrl: string | null;
  visibility: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  author: FeedAuthor;
  likeCount: number;
  commentCount: number;
  liked: boolean;
  bookmarked: boolean;
  comments: FeedComment[];
};

export type FeedPage = {
  posts: FeedPost[];
  nextCursor: string | null;
};

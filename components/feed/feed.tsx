"use client";

import { useCallback, useMemo, useState } from "react";
import { Loader2, NotebookPen, Sparkles } from "lucide-react";
import type { FeedPost } from "@/lib/feed-types";
import { PostCard } from "./post-card";
import { PostComposer } from "./post-composer";

export type FeedViewer = {
  id: string;
  name: string;
  handle: string;
  role: string;
  avatarUrl: string | null;
} | null;

export function Feed({
  initialPosts,
  initialCursor,
  viewer,
  query,
  saved,
  authorId,
  composer = false,
  emptyTitle = "Nothing here yet",
  emptyDescription = "When someone posts to campus, it shows up here.",
  onCountChange,
}: {
  initialPosts: FeedPost[];
  initialCursor: string | null;
  viewer: FeedViewer;
  query?: string;
  saved?: boolean;
  authorId?: string;
  composer?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onCountChange?: (count: number) => void;
}) {
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (saved) p.set("saved", "1");
    if (authorId) p.set("author", authorId);
    return p;
  }, [query, saved, authorId]);

  const refresh = useCallback(async () => {
    try {
      const qs = new URLSearchParams(params);
      qs.set("take", "10");
      const res = await fetch(`/api/posts?${qs.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { posts: FeedPost[]; nextCursor: string | null };
      setPosts(data.posts);
      setCursor(data.nextCursor);
      onCountChange?.(data.posts.length);
      setError(null);
    } catch {
      setError("Couldn't refresh the feed. Pull down or try again.");
    }
  }, [params, onCountChange]);

  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const qs = new URLSearchParams(params);
      qs.set("cursor", cursor);
      const res = await fetch(`/api/posts?${qs.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { posts: FeedPost[]; nextCursor: string | null };
      setPosts((cur) => {
        const seen = new Set(cur.map((p) => p.id));
        return [...cur, ...data.posts.filter((p) => !seen.has(p.id))];
      });
      setCursor(data.nextCursor);
    } catch {
      setError("Couldn't load more posts.");
    } finally {
      setLoadingMore(false);
    }
  }

  function handleDeleted(id: string) {
    setPosts((cur) => cur.filter((p) => p.id !== id));
  }

  return (
    <div className="flex flex-col gap-3">
      {composer && viewer ? (
        <PostComposer viewer={viewer} onCreated={refresh} />
      ) : null}

      {posts.length === 0 ? (
        <div className="vz-panel flex flex-col items-center px-6 py-12 text-center">
          <span className="mb-3 grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <NotebookPen size={21} />
          </span>
          <h3 className="text-sm font-bold">{emptyTitle}</h3>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted">{emptyDescription}</p>
          {composer && viewer ? (
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
              <Sparkles size={12} /> Start the conversation above
            </p>
          ) : null}
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            viewer={viewer}
            onDeleted={handleDeleted}
            onChanged={(next) =>
              setPosts((cur) => cur.map((p) => (p.id === next.id ? next : p)))
            }
          />
        ))
      )}

      {error ? <p className="text-center text-[11px] text-danger">{error}</p> : null}

      {cursor ? (
        <button
          type="button"
          onClick={loadMore}
          disabled={loadingMore}
          className="vz-panel flex h-11 items-center justify-center gap-2 text-xs font-semibold text-primary transition hover:border-primary/40 disabled:opacity-60"
        >
          {loadingMore ? <Loader2 size={14} className="animate-spin" /> : null}
          {loadingMore ? "Loading…" : "Load more posts"}
        </button>
      ) : posts.length > 0 ? (
        <p className="py-2 text-center text-[10px] text-muted-2">You&apos;re all caught up.</p>
      ) : null}
    </div>
  );
}

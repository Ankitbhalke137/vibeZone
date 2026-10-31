"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Bookmark,
  Globe2,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  Share2,
  Trash2,
  Users,
} from "lucide-react";
import type { FeedComment, FeedPost } from "@/lib/feed-types";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/format";
import { Avatar } from "@/components/avatar";
import { useToast } from "@/components/ui/toast";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";

const ROLE_LABEL: Record<string, string> = {
  senior: "Senior",
  moderator: "Moderator",
  admin: "Campus team",
};

export function PostCard({
  post,
  viewer,
  onDeleted,
  onChanged,
}: {
  post: FeedPost;
  viewer?: { id: string; role: string } | null;
  onDeleted?: (id: string) => void;
  onChanged?: (post: FeedPost) => void;
}) {
  const { toast } = useToast();
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.likeCount);
  const [bookmarked, setBookmarked] = useState(post.bookmarked);
  const [comments, setComments] = useState<FeedComment[]>(post.comments);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [showComments, setShowComments] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const canManage = post.author.role === "admin" || post.author.role === "moderator";
  const canDelete = Boolean(
    viewer && (viewer.id === post.author.id || ["moderator", "admin"].includes(viewer.role)),
  );

  async function toggleLike() {
    if (busy) return;
    setBusy(true);
    const next = !liked;
    setLiked(next);
    setLikes((n) => Math.max(0, n + (next ? 1 : -1)));
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, {
        method: next ? "POST" : "DELETE",
      });
      if (!res.ok) throw new Error();
    } catch {
      setLiked(!next);
      setLikes((n) => Math.max(0, n + (next ? -1 : 1)));
      toast({ title: "Couldn't update your like", tone: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function toggleBookmark() {
    const next = !bookmarked;
    setBookmarked(next);
    try {
      const res = await fetch(`/api/posts/${post.id}/bookmark`, {
        method: next ? "POST" : "DELETE",
      });
      if (!res.ok) throw new Error();
      toast({
        title: next ? "Saved to bookmarks" : "Removed from bookmarks",
        tone: next ? "success" : "info",
      });
    } catch {
      setBookmarked(!next);
      toast({ title: "Couldn't update bookmark", tone: "error" });
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't comment.");
      setComments((cur) => [...cur, data.comment as FeedComment]);
      setCommentCount((n) => n + 1);
      setDraft("");
      onChanged?.({ ...post, commentCount: commentCount + 1 });
    } catch (err) {
      toast({
        title: "Comment failed",
        description: err instanceof Error ? err.message : undefined,
        tone: "error",
      });
    } finally {
      setSending(false);
    }
  }

  async function share() {
    const url = `${window.location.origin}/post/${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${post.author.name} on VibeZone`, text: post.body.slice(0, 120), url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copied", tone: "success" });
      }
    } catch {
      /* user dismissed the share sheet */
    }
  }

  async function remove() {
    if (!window.confirm("Delete this post? This can't be undone.")) return;
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setDeleted(true);
      onDeleted?.(post.id);
      toast({ title: "Post deleted", tone: "success" });
    } catch {
      toast({ title: "Couldn't delete the post", tone: "error" });
    }
  }

  if (deleted) return null;

  return (
    <article className="vz-panel vz-card-hover overflow-hidden">
      <header className="flex items-start gap-3 px-4 pt-4">
        <Link href={`/u/${post.author.handle}`} aria-label={`@${post.author.handle}`}>
          <Avatar name={post.author.name} handle={post.author.handle} avatarUrl={post.author.avatarUrl} size="md" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <Link href={`/u/${post.author.handle}`} className="truncate text-sm font-bold hover:underline">
              {post.author.name}
            </Link>
            {ROLE_LABEL[post.author.role] ? (
              <span title={ROLE_LABEL[post.author.role]} className="inline-flex items-center gap-0.5 text-primary">
                <BadgeCheck size={13} aria-label={ROLE_LABEL[post.author.role]} />
              </span>
            ) : null}
            {canManage ? (
              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary">
                {ROLE_LABEL[post.author.role]}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px] text-muted">
            <span>@{post.author.handle}</span>
            <span aria-hidden>·</span>
            <time dateTime={post.createdAt}>{timeAgo(post.createdAt)}</time>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-0.5">
              {post.visibility === "public" ? <Globe2 size={10} /> : <Users size={10} />}
              {post.visibility === "public" ? "Public" : "Campus"}
            </span>
          </p>
        </div>
        <Dropdown
          trigger={({ open, toggle }) => (
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              aria-label="Post actions"
              className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-accent hover:text-foreground"
            >
              <MoreHorizontal size={16} />
            </button>
          )}
        >
          {(close) => (
            <div className="flex flex-col">
              <DropdownItem
                onClick={() => {
                  close();
                  void share();
                }}
              >
                <Share2 size={13} /> Copy link
              </DropdownItem>
              <Link
                href={`/u/${post.author.handle}`}
                onClick={close}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition hover:bg-accent"
              >
                <Users size={13} /> View profile
              </Link>
              {canDelete ? (
                <DropdownItem
                  onClick={() => {
                    close();
                    void remove();
                  }}
                  className="text-danger hover:bg-danger/10"
                >
                  <Trash2 size={13} /> Delete post
                </DropdownItem>
              ) : null}
            </div>
          )}
        </Dropdown>
      </header>

      <div className="px-4 pb-3 pt-2.5">
        <p className="whitespace-pre-wrap break-words text-[13.5px] leading-relaxed text-foreground">
          {post.body}
        </p>

        {post.tags.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/explore?q=${encodeURIComponent(tag)}`}
                className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary transition hover:bg-primary/15"
              >
                #{tag}
              </Link>
            ))}
          </div>
        ) : null}

        {post.imageUrl ? (
          <div className="mt-3 overflow-hidden rounded-xl border border-border bg-[var(--vz-card-3)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.imageUrl}
              alt=""
              loading="lazy"
              className="max-h-[460px] w-full object-cover"
            />
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-0.5 border-t border-[var(--vz-border-soft)] px-2 py-1.5">
        <ActionButton
          onClick={toggleLike}
          active={liked}
          activeClass="text-danger"
          label={liked ? "Unlike" : "Like"}
        >
          <Heart size={16} className={liked ? "fill-current" : undefined} />
          <span className="tabular-nums">{likes}</span>
        </ActionButton>
        <ActionButton
          onClick={() => setShowComments((v) => !v)}
          active={showComments}
          label="Comments"
        >
          <MessageCircle size={16} />
          <span className="tabular-nums">{commentCount}</span>
        </ActionButton>
        <ActionButton onClick={share} label="Share">
          <Share2 size={15} />
          <span className="hidden sm:inline">Share</span>
        </ActionButton>
        <div className="ml-auto">
          <ActionButton
            onClick={toggleBookmark}
            active={bookmarked}
            activeClass="text-primary"
            label={bookmarked ? "Remove bookmark" : "Bookmark"}
          >
            <Bookmark size={16} className={bookmarked ? "fill-current" : undefined} />
          </ActionButton>
        </div>
      </div>

      {showComments ? (
        <div className="border-t border-[var(--vz-border-soft)] bg-[var(--vz-card-2)] px-4 py-3">
          {comments.length === 0 && commentCount > 0 ? (
            <p className="mb-2 text-[11px] text-muted">
              Showing recent comments. Open the post to read all {commentCount}.
            </p>
          ) : null}
          <ul className="flex flex-col gap-2.5">
            {comments.map((comment) => (
              <li key={comment.id} className="flex items-start gap-2">
                <Avatar
                  name={comment.author.name}
                  handle={comment.author.handle}
                  avatarUrl={comment.author.avatarUrl}
                  size="xs"
                />
                <div className="min-w-0 flex-1 rounded-xl bg-card px-2.5 py-1.5">
                  <p className="flex items-center gap-1.5 text-[10px]">
                    <Link href={`/u/${comment.author.handle}`} className="font-semibold hover:underline">
                      {comment.author.name}
                    </Link>
                    <span className="text-muted">{timeAgo(comment.createdAt)}</span>
                  </p>
                  <p className="mt-0.5 whitespace-pre-wrap break-words text-[12px] leading-relaxed">
                    {comment.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <form onSubmit={submitComment} className="mt-3 flex items-end gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={500}
              placeholder="Add a comment…"
              aria-label="Add a comment"
              className="h-9 flex-1 rounded-xl border border-border bg-card px-3 text-xs outline-none transition placeholder:text-muted-2 focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              aria-label="Send comment"
              className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-white transition hover:brightness-110 disabled:opacity-40"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      ) : null}
    </article>
  );
}

function ActionButton({
  children,
  onClick,
  label,
  active,
  activeClass,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
  activeClass?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-medium text-muted transition hover:bg-accent hover:text-foreground",
        active && (activeClass ?? "text-primary"),
      )}
    >
      {children}
    </button>
  );
}

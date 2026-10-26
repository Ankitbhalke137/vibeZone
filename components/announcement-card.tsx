"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Pin } from "lucide-react";
import { cn } from "@/lib/utils";
import { ga } from "@/lib/ga";

const CATEGORY_STYLE: Record<string, string> = {
  Urgent: "bg-danger/10 text-danger border-danger/30",
  Academic: "bg-accent text-primary",
  Placements: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Events: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  Hostel: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Clubs: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
};

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-transparent px-2 py-0.5 text-[11px] font-semibold",
        CATEGORY_STYLE[category] ?? "bg-accent text-primary",
      )}
    >
      {category}
    </span>
  );
}

export function AnnouncementCard({
  id,
  title,
  category,
  pinned,
  excerpt,
  publishAt,
  authorName,
}: {
  id: string;
  title: string;
  category: string;
  pinned?: boolean;
  excerpt: string;
  publishAt: string;
  authorName?: string;
}) {
  const tracked = useRef(false);

  // FR-ANN-005 — fire the impression exactly once per mount
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    fetch(`/api/announcements/${id}/track`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event: "view" }),
    }).catch(() => {});
    ga.announcementView(id, category);
  }, [id, category]);

  return (
    <Link
      href={`/announcements/${id}`}
      onClick={() => {
        fetch(`/api/announcements/${id}/track`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ event: "click" }),
        }).catch(() => {});
        ga.announcementClick(id);
      }}
      className="block rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/40 hover:shadow"
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {pinned ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
            <Pin size={11} aria-hidden /> Pinned
          </span>
        ) : null}
        <CategoryBadge category={category} />
        <span className="ml-auto text-[11px] text-muted">
          {new Date(publishAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
      <h2 className="text-base font-semibold leading-snug">{title}</h2>
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{excerpt}</p>
      {authorName ? <p className="mt-2 text-[11px] text-muted">by {authorName}</p> : null}
    </Link>
  );
}

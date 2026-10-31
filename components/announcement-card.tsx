"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowUpRight, Pin } from "lucide-react";
import { ga } from "@/lib/ga";
import { Badge, type BadgeTone } from "@/components/ui/badge";

const TONES: Record<string, BadgeTone> = {
  Urgent: "red",
  Academic: "violet",
  Placements: "amber",
  Events: "magenta",
  Hostel: "cyan",
  Clubs: "green",
};

export function CategoryBadge({ category }: { category: string }) {
  return (
    <Badge tone={TONES[category] ?? "violet"} className="normal-case tracking-normal">
      {category}
    </Badge>
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

  // FR-ANN-005 — impression fires once per mount
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
      className="vz-panel vz-card-hover group block p-4"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {pinned ? (
          <Badge tone="violet" className="normal-case tracking-normal">
            <Pin size={10} /> Pinned
          </Badge>
        ) : null}
        <CategoryBadge category={category} />
        <span className="ml-auto text-[10px] font-medium text-muted">
          {new Date(publishAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
      <h2 className="mt-2 text-[15px] font-bold leading-snug transition group-hover:text-primary">
        {title}
      </h2>
      <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted">{excerpt}</p>
      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-[var(--vz-border-soft)] pt-2.5">
        <span className="text-[10px] text-muted-2">{authorName ? `by ${authorName}` : "Campus team"}</span>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary opacity-0 transition group-hover:opacity-100">
          Read <ArrowUpRight size={11} />
        </span>
      </div>
    </Link>
  );
}

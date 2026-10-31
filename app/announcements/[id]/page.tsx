import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, MousePointerClick, Pin } from "lucide-react";
import { db } from "@/lib/db";
import { sanitizeBody, stripTags } from "@/lib/sanitize";
import { Avatar } from "@/components/avatar";
import { CategoryBadge } from "@/components/announcement-card";
import { Badge } from "@/components/ui/badge";

export const revalidate = 60; // FR-ANN-002

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ann = await db.announcement.findUnique({ where: { id } }).catch(() => null);
  if (!ann) return { title: "Announcement" };
  return { title: ann.title, description: stripTags(ann.body).slice(0, 160) };
}

export default async function AnnouncementDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const now = new Date();
  const ann = await db.announcement.findUnique({
    where: { id },
    include: { author: { select: { name: true, handle: true, avatarUrl: true } } },
  });

  // Archived / expired / unknown → 404 (feed rules apply)
  if (
    !ann ||
    ann.archivedAt ||
    ann.publishAt > now ||
    (ann.expiresAt && ann.expiresAt <= now)
  ) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/announcements"
        className="mb-4 inline-flex items-center gap-1.5 text-[11px] font-medium text-muted transition hover:text-foreground"
      >
        <ArrowLeft size={13} /> All announcements
      </Link>

      <article className="vz-panel overflow-hidden">
        <div className="vz-soft-gradient border-b border-border px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-center gap-1.5">
            {ann.pinned ? (
              <Badge tone="violet" className="normal-case tracking-normal">
                <Pin size={10} /> Pinned
              </Badge>
            ) : null}
            <CategoryBadge category={ann.category} />
            <span className="ml-auto text-[10px] font-medium text-muted">
              {ann.publishAt.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight sm:text-[28px]">
            {ann.title}
          </h1>

          <div className="mt-3 flex items-center gap-2.5">
            <Avatar name={ann.author.name} handle={ann.author.handle} avatarUrl={ann.author.avatarUrl} size="sm" />
            <div>
              <p className="text-[11px] font-semibold">{ann.author.name}</p>
              <p className="text-[10px] text-muted">Campus team · @{ann.author.handle}</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6">
          {/* body was sanitized on write; sanitized again on read (defense in depth) */}
          <div
            className="text-[14px] leading-relaxed text-foreground [&_a]:text-primary [&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_p+p]:mt-3 [&_ul]:mt-2"
            dangerouslySetInnerHTML={{ __html: sanitizeBody(ann.body) }}
          />

          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-3 text-[10px] text-muted">
            <span className="inline-flex items-center gap-1">
              <Eye size={11} /> {ann.viewCount} views
            </span>
            <span className="inline-flex items-center gap-1">
              <MousePointerClick size={11} /> {ann.clickCount} clicks
            </span>
            <span className="ml-auto">Something wrong with this post? Report it in #help.</span>
          </div>
        </div>
      </article>

      <div className="mt-4 flex justify-center">
        <Link
          href="/announcements"
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:underline"
        >
          <ArrowLeft size={12} /> Back to all announcements
        </Link>
      </div>
    </div>
  );
}

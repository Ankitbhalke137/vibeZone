import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { sanitizeBody, stripTags } from "@/lib/sanitize";
import { Avatar } from "@/components/avatar";
import { CategoryBadge } from "@/components/announcement-card";

export const revalidate = 60; // FR-ANN-002

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ann = await db.announcement.findUnique({ where: { id } });
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

  // Archived / expired / unknown → 404 (pinned-expired still hidden: feed rules apply)
  if (
    !ann ||
    ann.archivedAt ||
    ann.publishAt > now ||
    (ann.expiresAt && ann.expiresAt <= now)
  ) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-2xl py-6">
      <Link
        href="/announcements"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-foreground"
      >
        <ArrowLeft size={15} aria-hidden /> All announcements
      </Link>

      <header className="mb-5 flex flex-wrap items-center gap-2">
        {ann.pinned ? (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
            Pinned
          </span>
        ) : null}
        <CategoryBadge category={ann.category} />
        <span className="text-xs text-muted">
          {ann.publishAt.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </header>

      <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{ann.title}</h1>

      <div className="mt-4 flex items-center gap-2.5">
        <Avatar name={ann.author.name} handle={ann.author.handle} avatarUrl={ann.author.avatarUrl} size="sm" />
        <span className="text-sm text-muted">{ann.author.name}</span>
      </div>

      {/* body was sanitized on write; sanitized again on read (defense in depth) */}
      <div
        className="prose-vz mt-6 text-[15px] leading-relaxed text-foreground [&_a]:text-primary [&_a]:underline [&_li]:ml-5 [&_p+p]:mt-3 [&_ul]:list-disc"
        dangerouslySetInnerHTML={{ __html: sanitizeBody(ann.body) }}
      />

      <div className="mt-8 border-t border-border pt-4 text-center text-xs text-muted">
        {ann.viewCount} views · {ann.clickCount} clicks · something wrong with this post? Report it
        in <span className="font-medium">#help</span> (Week 3).
      </div>
    </article>
  );
}

import { Megaphone, Pin } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { AnnouncementManager } from "@/components/admin/announcement-manager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Announcements · Admin" };

export default async function AdminAnnouncements() {
  const [items, live, pinned] = await Promise.all([
    db.announcement.findMany({
      orderBy: [{ pinned: "desc" }, { publishAt: "desc" }],
      take: 100,
      include: { author: { select: { handle: true } } },
    }),
    db.announcement.count({ where: { archivedAt: null } }),
    db.announcement.count({ where: { archivedAt: null, pinned: true } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="Campus communications"
        title="Announcements"
        description="Publish official updates, pin what matters and keep the campus noticeboard tidy."
        actions={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-muted">
              <Megaphone size={12} className="text-primary" /> {live} live
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-muted">
              <Pin size={12} className="text-primary" /> {pinned} pinned
            </span>
          </div>
        }
      />

      <AnnouncementManager
        items={items.map((a) => ({
          id: a.id,
          title: a.title,
          category: a.category,
          pinned: a.pinned,
          notify: a.notify,
          archived: !!a.archivedAt,
          publishAt: a.publishAt.toISOString(),
          expiresAt: a.expiresAt?.toISOString() ?? null,
          viewCount: a.viewCount,
          clickCount: a.clickCount,
          authorHandle: a.author.handle,
        }))}
      />
    </div>
  );
}

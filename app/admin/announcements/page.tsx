import { db } from "@/lib/db";
import { AnnouncementManager } from "@/components/admin/announcement-manager";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncements() {
  const items = await db.announcement.findMany({
    orderBy: [{ pinned: "desc" }, { publishAt: "desc" }],
    take: 100,
    include: { author: { select: { handle: true } } },
  });

  return (
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
  );
}

import Link from "next/link";
import { Megaphone, Pin } from "lucide-react";
import { db } from "@/lib/db";
import { stripTags } from "@/lib/sanitize";
import { AnnouncementCard } from "@/components/announcement-card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export const revalidate = 60; // FR-ANN-002 — SSR cached 60 s, no login required

export const metadata = {
  title: "Announcements",
  description: "Official campus updates — readable by anyone, no sign-in needed.",
};

async function getFeed() {
  const now = new Date();
  try {
    return await db.announcement.findMany({
      where: {
        archivedAt: null,
        publishAt: { lte: now },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: [{ pinned: "desc" }, { publishAt: "desc" }],
      take: 50,
      include: { author: { select: { name: true } } },
    });
  } catch (err) {
    // DB unreachable during build/ISR — render the empty state instead of failing the page
    console.error("[announcements] feed query failed:", err);
    return [];
  }
}

export default async function AnnouncementsPage() {
  const items = await getFeed();
  const pinned = items.filter((a) => a.pinned);
  const rest = items.filter((a) => !a.pinned);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <PageHeader
        eyebrow="Notice board"
        title="Announcements"
        description="Official academic, hostel, club and placement updates. Readable without signing in."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-muted">
            <Megaphone size={12} className="text-primary" /> {items.length} live
          </span>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<Megaphone size={20} />}
          title="Nothing posted yet"
          description="Official campus updates will appear here as soon as the team publishes them."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {pinned.length > 0 ? (
            <section className="flex flex-col gap-2">
              <h2 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-2">
                <Pin size={11} /> Pinned
              </h2>
              {pinned.map((a) => (
                <AnnouncementCard
                  key={a.id}
                  id={a.id}
                  title={a.title}
                  category={a.category}
                  pinned
                  excerpt={stripTags(a.body).slice(0, 180)}
                  publishAt={a.publishAt.toISOString()}
                  authorName={a.author.name}
                />
              ))}
            </section>
          ) : null}

          <section className="flex flex-col gap-2">
            {pinned.length > 0 && rest.length > 0 ? (
              <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-2">Latest</h2>
            ) : null}
            {rest.map((a) => (
              <AnnouncementCard
                key={a.id}
                id={a.id}
                title={a.title}
                category={a.category}
                excerpt={stripTags(a.body).slice(0, 180)}
                publishAt={a.publishAt.toISOString()}
                authorName={a.author.name}
              />
            ))}
          </section>
        </div>
      )}

      <p className="text-center text-[11px] text-muted">
        Sign in with your campus email to chat, RSVP, vote and share notes.{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in →
        </Link>
      </p>
    </div>
  );
}

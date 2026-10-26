import Link from "next/link";
import { db } from "@/lib/db";
import { stripTags } from "@/lib/sanitize";
import { AnnouncementCard } from "@/components/announcement-card";

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

  return (
    <div className="flex flex-col gap-5 py-6">
      <header>
        <h1 className="text-2xl font-bold">Announcements</h1>
        <p className="mt-1 text-sm text-muted">
          Official campus updates · no sign-in needed to read
        </p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted">
          Nothing posted yet — check back soon.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((a) => (
            <li key={a.id}>
              <AnnouncementCard
                id={a.id}
                title={a.title}
                category={a.category}
                pinned={a.pinned}
                excerpt={stripTags(a.body).slice(0, 180)}
                publishAt={a.publishAt.toISOString()}
                authorName={a.author.name}
              />
            </li>
          ))}
        </ul>
      )}

      <p className="text-center text-xs text-muted">
        Sign in with your campus email to chat, RSVP, vote and upload notes.{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in →
        </Link>
      </p>
    </div>
  );
}

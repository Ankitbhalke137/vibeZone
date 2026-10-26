import Link from "next/link";
import { CalendarDays, MapPin, Video } from "lucide-react";
import { db } from "@/lib/db";
import { formatIST, formatISTTime } from "@/lib/time";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Events",
  description: "Campus events, RSVPs and reminders — open to everyone.",
};

const CATEGORY_STYLE: Record<string, string> = {
  Academic: "bg-accent text-primary",
  Cultural: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  Sports: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Clubs: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  Placement: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export default async function EventsPage() {
  let events: Awaited<ReturnType<typeof getEvents>> = [];
  try {
    events = await getEvents();
  } catch (err) {
    console.error("[events] query failed:", err);
  }

  const now = Date.now();
  const upcoming = events.filter((e) => e.startsAt.getTime() >= now - 12 * 60 * 60_000);
  const past = events.filter((e) => e.startsAt.getTime() < now - 12 * 60 * 60_000).reverse();

  return (
    <div className="flex flex-col gap-6 py-6">
      <header>
        <h1 className="text-2xl font-bold">Events</h1>
        <p className="mt-1 text-sm text-muted">
          Everything happening on campus · RSVP to get reminders 24 h and 1 h before
        </p>
      </header>

      {upcoming.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted">
          No upcoming events yet — check back soon.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {upcoming.map((e) => (
            <li key={e.id}>
              <Link
                href={`/events/${e.id}`}
                className="block rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/40 hover:shadow"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {e.category ? (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        CATEGORY_STYLE[e.category] ?? "bg-accent text-primary",
                      )}
                    >
                      {e.category}
                    </span>
                  ) : null}
                  {e.externalStreamUrl ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[11px] font-semibold text-violet-600 dark:text-violet-400">
                      <Video size={10} aria-hidden /> online
                    </span>
                  ) : null}
                  <span className="ml-auto text-[11px] text-muted">
                    {formatIST(e.startsAt, { weekday: "short" })} · {formatISTTime(e.startsAt)} IST
                  </span>
                </div>
                <h2 className="text-base font-semibold leading-snug">{e.title}</h2>
                {e.location ? (
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                    <MapPin size={11} aria-hidden /> {e.location}
                  </p>
                ) : null}
                <div className="mt-2 flex items-center gap-3 text-[11px] text-muted">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays size={11} aria-hidden /> {e._count.rsvps} going
                  </span>
                  {e.capacity ? (
                    <span>
                      {e._count.rsvps >= e.capacity ? "Full" : `${e.capacity - e._count.rsvps} spots left`}
                    </span>
                  ) : null}
                  {e.rsvpClosedAt ? <span className="font-semibold text-danger">RSVP closed</span> : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {past.length > 0 ? (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-muted">Past events</h2>
          <ul className="flex flex-col gap-2">
            {past.slice(0, 5).map((e) => (
              <li key={e.id}>
                <Link
                  href={`/events/${e.id}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-xs transition hover:bg-accent/50"
                >
                  <span className="truncate">{e.title}</span>
                  <span className="shrink-0 text-muted">{formatIST(e.startsAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function getEvents() {
  return db.event.findMany({
    where: { status: "published" },
    orderBy: { startsAt: "desc" },
    take: 100,
    include: { _count: { select: { rsvps: { where: { status: "going" } } } } },
  });
}

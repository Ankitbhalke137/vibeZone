import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock3, MapPin, Users, Video } from "lucide-react";
import { db } from "@/lib/db";
import { formatIST, formatISTTime } from "@/lib/time";
import { PageHeader } from "@/components/ui/page-header";
import { Badge, type BadgeTone } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Events · Admin" };

const STATUS_TONE: Record<string, BadgeTone> = {
  published: "green",
  draft: "amber",
  cancelled: "red",
};

export default async function AdminEventsPage() {
  const events = await db.event.findMany({
    orderBy: { startsAt: "desc" },
    take: 100,
    include: {
      creator: { select: { handle: true } },
      _count: { select: { rsvps: { where: { status: "going" } } } },
    },
  });

  const now = Date.now();
  const upcoming = events.filter(
    (event) => event.startsAt.getTime() >= now && event.status === "published",
  ).length;
  const totalRsvps = events.reduce((sum, event) => sum + event._count.rsvps, 0);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="Campus calendar"
        title="Events"
        description="Every event across campus, including drafts and past editions. RSVPs are live."
        actions={
          <Link
            href="/events"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-[11px] font-bold text-white transition hover:brightness-110"
          >
            Open calendar <ArrowUpRight size={13} />
          </Link>
        }
      />

      <section className="grid grid-cols-3 gap-2.5">
        <Stat icon={CalendarDays} label="Upcoming" value={upcoming} tone="bg-primary/10 text-primary" />
        <Stat icon={Clock3} label="All events" value={events.length} tone="bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400" />
        <Stat icon={Users} label="Total RSVPs" value={totalRsvps} tone="bg-cyan-500/10 text-cyan-700 dark:text-cyan-400" />
      </section>

      <section className="vz-panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-bold">Event register</h2>
          <span className="text-[10px] text-muted">Newest first</span>
        </div>

        {events.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <span className="mx-auto grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
              <CalendarDays size={20} />
            </span>
            <p className="mt-3 text-sm font-bold">No events yet</p>
            <p className="mt-1 text-xs text-muted">Published events will appear here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {events.map((event) => (
              <li key={event.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 leading-none text-primary">
                  <span className="text-[8px] font-bold uppercase">
                    {formatIST(event.startsAt, { day: undefined, year: undefined })}
                  </span>
                  <span className="text-[15px] font-black">
                    {formatIST(event.startsAt, { month: undefined, year: undefined })}
                  </span>
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Link
                      href={`/events/${event.id}`}
                      className="truncate text-[12px] font-bold hover:text-primary"
                    >
                      {event.title}
                    </Link>
                    <Badge tone={STATUS_TONE[event.status] ?? "neutral"} className="normal-case tracking-normal">
                      {event.status}
                    </Badge>
                    {event.externalStreamUrl ? (
                      <span className="inline-flex items-center gap-0.5 text-[9px] text-primary">
                        <Video size={9} /> online
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9.5px] text-muted">
                    <span>
                      {formatIST(event.startsAt, { weekday: "short" })} · {formatISTTime(event.startsAt)} IST
                    </span>
                    {event.location ? (
                      <span className="inline-flex items-center gap-0.5">
                        <MapPin size={8} /> {event.location}
                      </span>
                    ) : null}
                    <span>· by @{event.creator.handle}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 text-[10px] text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Users size={11} className="text-primary" /> {event._count.rsvps} going
                  </span>
                  {event.capacity ? (
                    <span className="hidden sm:inline">/ {event.capacity} seats</span>
                  ) : null}
                  <Link
                    href={`/events/${event.id}`}
                    aria-label={`Open ${event.title}`}
                    className="grid size-8 place-items-center rounded-lg border border-border text-muted transition hover:bg-accent hover:text-primary"
                  >
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-center text-[10px] text-muted-2">
        RSVP lists and CSV export are available from each event page for organisers.
      </p>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ size?: number | string }>;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="vz-panel flex items-center gap-2.5 p-3">
      <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${tone}`}>
        <Icon size={16} />
      </span>
      <div>
        <p className="text-lg font-black leading-none">{value}</p>
        <p className="mt-0.5 text-[10px] text-muted">{label}</p>
      </div>
    </div>
  );
}

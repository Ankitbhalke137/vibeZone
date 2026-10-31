import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CalendarX2,
  MapPin,
  Users,
  Video,
} from "lucide-react";
import { db } from "@/lib/db";
import { formatIST, formatISTTime, istParts } from "@/lib/time";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Events",
  description: "Campus events, RSVPs and reminders — open to everyone.",
};

const CATEGORY_TONE: Record<string, "violet" | "magenta" | "green" | "amber" | "cyan"> = {
  Academic: "violet",
  Cultural: "magenta",
  Sports: "green",
  Clubs: "cyan",
  Placement: "amber",
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
  const past = events.filter((e) => e.startsAt.getTime() < now - 12 * 60 * 60_000).slice(0, 6);
  const [featured, ...rest] = upcoming;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Campus calendar"
        title="Events"
        description="Everything happening on campus. RSVP to get reminders 24 hours and 1 hour before."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-muted">
            <CalendarDays size={12} className="text-primary" /> {upcoming.length} upcoming
          </span>
        }
      />

      {upcoming.length === 0 ? (
        <EmptyState
          icon={<CalendarDays size={20} />}
          title="No upcoming events"
          description="When the campus team publishes an event, it will appear here with RSVP and reminders."
        />
      ) : (
        <>
          {featured ? <FeaturedEvent event={featured} /> : null}

          {rest.length > 0 ? (
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {rest.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </section>
          ) : null}
        </>
      )}

      {past.length > 0 ? (
        <section className="vz-panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="flex items-center gap-1.5 text-[12px] font-bold">
              <CalendarX2 size={13} className="text-muted" /> Past events
            </h2>
            <span className="text-[10px] text-muted">{past.length} recent</span>
          </div>
          <ul className="divide-y divide-border">
            {past.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/events/${e.id}`}
                  className="group flex items-center gap-3 px-4 py-2.5 transition hover:bg-accent/40"
                >
                  <span className="w-16 shrink-0 text-[10px] font-medium text-muted">
                    {formatIST(e.startsAt, { year: undefined })}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[11.5px] font-semibold group-hover:text-primary">
                    {e.title}
                  </span>
                  <span className="hidden shrink-0 text-[10px] text-muted sm:block">
                    {e._count.rsvps} went
                  </span>
                  <ArrowRight size={12} className="shrink-0 text-muted-2 group-hover:text-primary" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

type EventRow = Awaited<ReturnType<typeof getEvents>>[number];

function FeaturedEvent({ event }: { event: EventRow }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="vz-panel vz-card-hover group relative grid overflow-hidden p-0 lg:grid-cols-[1.1fr_0.9fr]"
    >
      <div className="relative z-10 flex flex-col justify-between gap-4 p-5 sm:p-6">
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone="violet" className="normal-case tracking-normal">Featured</Badge>
            {event.category ? (
              <Badge tone={CATEGORY_TONE[event.category] ?? "violet"} className="normal-case tracking-normal">
                {event.category}
              </Badge>
            ) : null}
            {event.externalStreamUrl ? (
              <Badge tone="green" className="normal-case tracking-normal">
                <Video size={10} /> Online
              </Badge>
            ) : null}
          </div>
          <h2 className="mt-3 max-w-md text-xl font-black leading-tight tracking-tight transition group-hover:text-primary sm:text-2xl">
            {event.title}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={12} className="text-primary" />
              {formatIST(event.startsAt, { weekday: "short" })} · {formatISTTime(event.startsAt)} IST
            </span>
            {event.location ? (
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} /> {event.location}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
            <Users size={11} /> {event._count.rsvps} going
          </span>
          {event.capacity ? (
            <span className="text-[10px] text-muted">
              {event._count.rsvps >= event.capacity
                ? "Full"
                : `${event.capacity - event._count.rsvps} spots left`}
            </span>
          ) : null}
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
            View event <ArrowRight size={12} />
          </span>
        </div>
      </div>

      <div className="relative min-h-36 overflow-hidden bg-[var(--vz-card-3)] lg:min-h-52">
        {event.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.coverImageUrl} alt="" className="size-full object-cover" />
        ) : (
          <div className="vz-hero absolute inset-0">
            <div className="vz-hero-glow absolute inset-0" />
            <div className="absolute inset-0 grid place-items-center text-white/80">
              <div className="text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em]">Save the date</p>
                <p className="mt-1 text-3xl font-black">{formatIST(event.startsAt, { day: "numeric", year: undefined })}</p>
                <p className="text-[11px] font-medium text-white/70">
                  {formatISTTime(event.startsAt)} IST
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function EventCard({ event }: { event: EventRow }) {
  const parts = istParts(event.startsAt);
  return (
    <Link href={`/events/${event.id}`} className="vz-panel vz-card-hover group flex flex-col overflow-hidden p-0">
      <div className="relative h-24 overflow-hidden bg-[var(--vz-card-3)]">
        {event.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.coverImageUrl} alt="" className="size-full object-cover" />
        ) : (
          <div className="vz-map size-full opacity-70 dark:opacity-40" />
        )}
        <div className="absolute left-3 top-3 grid size-11 place-items-center rounded-xl border border-white/20 bg-black/40 leading-none text-white backdrop-blur">
          <span className="text-[8px] font-bold uppercase">{MONTHS[parts.month - 1]}</span>
          <span className="text-sm font-black">{parts.day}</span>
        </div>
        {event.category ? (
          <span className="absolute right-2.5 top-2.5 rounded-full bg-card/90 px-2 py-0.5 text-[9px] font-bold text-primary backdrop-blur">
            {event.category}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="line-clamp-2 text-[13px] font-bold leading-snug transition group-hover:text-primary">
          {event.title}
        </h3>
        <p className="mt-1 truncate text-[10.5px] text-muted">
          {formatISTTime(event.startsAt)} IST
        </p>
        {event.location ? (
          <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-muted">
            <MapPin size={10} /> {event.location}
          </p>
        ) : null}
        <div className="mt-2.5 flex items-center gap-1.5 border-t border-[var(--vz-border-soft)] pt-2 text-[9.5px] text-muted">
          <Users size={10} /> {event._count.rsvps} going
          {event.externalStreamUrl ? (
            <span className="ml-auto inline-flex items-center gap-0.5 text-primary">
              <Video size={10} /> Online
            </span>
          ) : null}
        </div>
      </div>
    </Link>
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

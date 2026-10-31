import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CalendarPlus,
  Clock,
  MapPin,
  Users,
  Video,
} from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatIST, formatISTTime } from "@/lib/time";
import { Badge } from "@/components/ui/badge";
import { RsvpButton } from "@/components/events/rsvp-button";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await db.event.findUnique({ where: { id }, select: { title: true, description: true } }).catch(() => null);
  if (!event) return { title: "Event" };
  return {
    title: event.title,
    description: event.description?.slice(0, 160) ?? "A campus event on VibeZone.",
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser();
  if (!me) redirect(`/login?next=/events/${(await params).id}`);

  const { id } = await params;
  const event = await db.event.findUnique({
    where: { id },
    include: {
      creator: { select: { name: true, handle: true } },
      _count: { select: { rsvps: { where: { status: "going" } } } },
      rsvps: {
        where: { userId: me.id },
        select: { status: true },
        take: 1,
      },
    },
  });

  if (!event || event.status !== "published") notFound();

  const rsvpClosed = Boolean(event.rsvpClosedAt && event.rsvpClosedAt <= new Date());
  const started = event.startsAt.getTime() < Date.now() - 12 * 3_600_000;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/events"
        className="mb-4 inline-flex items-center gap-1.5 text-[11px] font-medium text-muted transition hover:text-foreground"
      >
        <ArrowLeft size={13} /> All events
      </Link>

      <article className="vz-panel overflow-hidden">
        {event.coverImageUrl ? (
          <div className="relative h-52 w-full overflow-hidden bg-[var(--vz-card-3)] sm:h-64">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={event.coverImageUrl} alt="" className="size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center gap-1.5">
              {event.category ? <Badge tone="violet" className="normal-case tracking-normal">{event.category}</Badge> : null}
              {event.externalStreamUrl ? (
                <Badge tone="green" className="normal-case tracking-normal">
                  <Video size={10} /> Online
                </Badge>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="vz-hero relative flex min-h-36 items-end p-5 text-white">
            <div className="vz-hero-glow pointer-events-none absolute inset-0" />
            <div className="relative flex flex-wrap items-center gap-1.5">
              {event.category ? <Badge tone="violet" className="border-white/25 bg-white/15 normal-case tracking-normal text-white">{event.category}</Badge> : null}
              {event.externalStreamUrl ? (
                <Badge tone="green" className="border-white/25 bg-white/15 normal-case tracking-normal text-white">
                  <Video size={10} /> Online
                </Badge>
              ) : null}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <header>
            <h1 className="text-2xl font-black leading-tight tracking-tight">{event.title}</h1>
            {event.creator ? (
              <p className="mt-1 text-[11px] text-muted">
                Hosted by{" "}
                <Link href={`/u/${event.creator.handle}`} className="font-semibold text-foreground hover:text-primary">
                  {event.creator.name}
                </Link>
              </p>
            ) : null}
          </header>

          <div className="grid gap-2 sm:grid-cols-2">
            <InfoRow icon={CalendarDays} label="Date">
              {formatIST(event.startsAt, { weekday: "long" })}
            </InfoRow>
            <InfoRow icon={Clock} label="Time">
              {formatISTTime(event.startsAt)} IST
              {event.endsAt ? ` – ${formatISTTime(event.endsAt)} IST` : ""}
            </InfoRow>
            <InfoRow icon={MapPin} label="Location">
              {event.location ?? "Campus"}
            </InfoRow>
            <InfoRow icon={Users} label="Attendance">
              {event._count.rsvps} going
              {event.capacity ? ` · ${Math.max(0, event.capacity - event._count.rsvps)} spots left` : ""}
            </InfoRow>
          </div>

          {event.description ? (
            <div className="border-t border-border pt-4">
              <h2 className="text-[11px] font-bold uppercase tracking-wide text-muted-2">About this event</h2>
              <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/90">
                {event.description}
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <RsvpButton
              eventId={event.id}
              initialStatus={(event.rsvps[0]?.status as "going" | "maybe" | "not_going" | null) ?? null}
              capacity={event.capacity}
              going={event._count.rsvps}
              closed={rsvpClosed || started}
              signedIn
            />
            <a
              href={`/api/events/${event.id}/ics`}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-xs font-semibold transition hover:bg-accent"
            >
              <CalendarPlus size={14} /> Add to calendar
            </a>
            {event.externalStreamUrl ? (
              <a
                href={event.externalStreamUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-primary transition hover:bg-accent"
              >
                <Video size={14} /> Join stream
              </a>
            ) : null}
          </div>

          {started ? (
            <p className="text-[11px] text-muted">This event has already taken place.</p>
          ) : null}
        </div>
      </article>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-border bg-[var(--vz-card-2)] px-3 py-2">
      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon size={13} />
      </span>
      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-wide text-muted-2">{label}</p>
        <p className="mt-0.5 text-[11.5px] font-semibold">{children}</p>
      </div>
    </div>
  );
}

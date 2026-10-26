import Link from "next/link";
import { CalendarDays, MapPin, Megaphone, Pin } from "lucide-react";
import type { DashAnnouncement, DashEvent } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";
import { DashCard, Pill, SectionTitle } from "./ui";

type Tone = "violet" | "magenta" | "green" | "amber" | "red" | "cyan" | "neutral";

const CATEGORY_TONE: Record<string, Tone> = {
  Academic: "violet",
  Campus: "cyan",
  Hostel: "amber",
  Clubs: "magenta",
  Events: "green",
  Placements: "green",
  Urgent: "red",
};

export function AnnouncementsEvents({
  announcements,
  events,
}: {
  announcements: DashAnnouncement[];
  events: DashEvent[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Announcements */}
      <DashCard className="p-4">
        <SectionTitle
          icon={<Megaphone size={14} />}
          title="Announcements"
          subtitle="Public board · posted by verified admins"
          action={
            <Link href="/announcements" className="text-[9px] font-medium text-[var(--vz-violet-2)] hover:underline">
              View all
            </Link>
          }
        />

        <ul className="mt-3 flex flex-col gap-2">
          {announcements.map((a) => (
            <li key={a.id}>
              <Link
                href={a.id.startsWith("demo") ? "/announcements" : `/announcements/${a.id}`}
                className="block rounded-xl border border-[var(--vz-border-soft)] bg-[var(--vz-card-2)] p-2.5 transition hover:border-[var(--vz-violet)]/40"
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  {a.pinned ? (
                    <Pill tone="red">
                      <Pin size={8} /> Pinned
                    </Pill>
                  ) : null}
                  <Pill tone={CATEGORY_TONE[a.category] ?? "violet"}>{a.category}</Pill>
                  <span className="ml-auto text-[8px] text-[var(--vz-muted-2)]">{a.publishLabel}</span>
                </div>
                <p className="mt-1.5 text-[11px] font-semibold leading-snug">{a.title}</p>
                <p className="mt-0.5 line-clamp-2 text-[9px] leading-relaxed text-[var(--vz-muted)]">{a.excerpt}</p>
                <p className="mt-1 text-[8px] text-[var(--vz-muted-2)]">{a.authorName}</p>
              </Link>
            </li>
          ))}
        </ul>
      </DashCard>

      {/* Events */}
      <DashCard className="p-4">
        <SectionTitle
          icon={<CalendarDays size={14} />}
          title="Upcoming Events"
          subtitle="RSVP to get automatic reminders"
          action={
            <Link href="/events" className="text-[9px] font-medium text-[var(--vz-violet-2)] hover:underline">
              Calendar
            </Link>
          }
        />

        <ul className="mt-3 flex flex-col gap-2">
          {events.map((e) => {
            const going = e.id === "demo-e2";
            return (
              <li
                key={e.id}
                className="flex items-center gap-2.5 rounded-xl border border-[var(--vz-border-soft)] bg-[var(--vz-card-2)] p-2.5"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--vz-violet)]/15 text-center">
                  <span className="block text-[7px] font-bold uppercase leading-none text-[var(--vz-violet-2)]">
                    {e.month}
                  </span>
                  <span className="block text-[13px] font-bold leading-tight">{e.day}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold">{e.title}</p>
                  <p className="flex items-center gap-1 truncate text-[9px] text-[var(--vz-muted)]">
                    <MapPin size={8} /> {e.location ?? "Campus"} · {e.timeLabel}
                  </p>
                  <p className="mt-0.5 text-[8px] text-[var(--vz-muted-2)]">
                    {e.going} going
                    {e.capacity ? ` · ${Math.max(0, e.capacity - e.going)} spots left` : ""}
                  </p>
                </div>
                <Link
                  href={e.isDemo ? "/events" : `/events/${e.id}`}
                  className={cn(
                    "shrink-0 rounded-lg px-2 py-1 text-[9px] font-semibold transition",
                    going
                      ? "bg-[var(--vz-green)]/15 text-[var(--vz-green)]"
                      : "bg-[var(--vz-violet)] text-white hover:opacity-90",
                  )}
                >
                  {going ? "going" : "RSVP"}
                </Link>
              </li>
            );
          })}
        </ul>
      </DashCard>
    </div>
  );
}

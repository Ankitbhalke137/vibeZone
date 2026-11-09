import Link from "next/link";
import { redirect } from "next/navigation";
import { MotionDiv } from "@/components/ui/motion";
import {
  ArrowRight,
  BellRing,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Flame,
  GraduationCap,
  Hash,
  MapPin,
  Megaphone,
  MessagesSquare,
  PackageSearch,
  Sparkles,
  Trophy,
  Users,
  Vote,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDashboardData } from "@/lib/dashboard-data";
import { listPosts } from "@/lib/posts";
import { Avatar } from "@/components/avatar";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/page-header";
import { Feed } from "@/components/feed/feed";
import { PollWidget } from "@/components/home/poll-widget";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Home" };

function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      hour12: false,
    }).format(new Date()),
  );
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function HomePage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/home");

  const data = await getDashboardData();
  if (!data) redirect("/login?next=/home");

  const [feed, people] = await Promise.all([
    listPosts({ viewerId: me.id, take: 10, limitComments: 2 }),
    db.user
      .findMany({
        where: { id: { not: me.id }, status: "active" },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: {
          id: true,
          name: true,
          handle: true,
          avatarUrl: true,
          branch: true,
          year: true,
          role: true,
        },
      })
      .catch(() => []),
  ]);

  const firstName = data.user.name.split(" ")[0] || "there";
  const today = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const quick = [
    {
      href: "/announcements",
      label: "Announcements",
      detail: `${data.announcements.length} live`,
      icon: Megaphone,
      chip: "bg-primary/10 text-primary",
    },
    {
      href: "/chat",
      label: "Campus chat",
      detail: data.channels[0]?.online ? `${data.channels[0].online} members` : "Join a channel",
      icon: MessagesSquare,
      chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      href: "/events",
      label: "Events",
      detail: `${data.counts.events} upcoming`,
      icon: CalendarDays,
      chip: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
    },
    {
      href: "/notes",
      label: "Notes",
      detail: `${data.counts.notes} resources`,
      icon: BookOpen,
      chip: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
    },
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-4">
        {/* Hero — glass gradient */}
        <section className="relative isolate overflow-hidden rounded-2xl p-5 sm:p-6">
          <div className="absolute inset-0 z-0 rounded-2xl bg-[var(--vz-card-2)] border border-[var(--vz-border)]" />
          <div className="relative z-10">
            <div className="vz-hero relative overflow-hidden rounded-2xl p-4 text-white">
              <div className="vz-hero-glow pointer-events-none absolute inset-0" />
              <div className="pointer-events-none absolute -right-8 -top-10 size-40 rounded-full bg-white/10 blur-3xl" />
              <div className="relative">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-white/75">
                      {greeting()}, {firstName} 👋
                    </p>
                    <h1 className="mt-1 max-w-lg text-[24px] font-black leading-tight tracking-tight sm:text-30px">
                      Your campus, <span className="text-white/90">all in one place.</span>
                    </h1>
                    <p className="mt-1.5 max-w-md text-[12px] leading-relaxed text-white/75">
                      Catch up on what matters, share something with campus, and keep your streak alive.
                    </p>
                  </div>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold backdrop-blur">
                    {today}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Link
                    href="/create"
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white px-4 text-xs font-bold text-primary transition hover:bg-white/90"
                  >
                    <Sparkles size={13} /> Share something
                  </Link>
                  <Link
                    href="/explore"
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white/15 px-4 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/25"
                  >
                    Explore campus <ArrowRight size={13} />
                  </Link>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <MotionDiv
                    whileInView={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.4 }}
                  >
                    <HeroStat icon={Sparkles} label="Level" value={`${data.stats.level}`} hint={data.stats.levelName} />
                  </MotionDiv>
                  <MotionDiv
                    whileInView={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <HeroStat icon={Trophy} label="Points" value={data.stats.xp.toLocaleString("en-IN")} hint={`${data.stats.xpToNext} to next`} />
                  </MotionDiv>
                  <MotionDiv
                    whileInView={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <HeroStat icon={Trophy} label="Rank" value={data.stats.rank ? `#${data.stats.rank}` : "—"} hint="This week" />
                  </MotionDiv>
                  <MotionDiv
                    whileInView={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <HeroStat icon={Flame} label="Streak" value={`${data.stats.streak}d`} hint={data.stats.streak > 0 ? "Keep it going" : "Start today"} />
                  </MotionDiv>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-[9px] font-medium text-white/70">
                    <span>Level {data.stats.level}</span>
                    <span>{Math.round(data.stats.levelProgress * 100)}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-white/90 transition-all"
                      style={{ width: `${Math.max(4, Math.min(100, data.stats.levelProgress * 100))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop content (text + actions + stats) */}
            <div className="lg:block mt-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-primary">
                    {greeting()}, {firstName} 👋
                  </p>
                  <h1 className="mt-1 max-w-lg text-[26px] font-black leading-tight tracking-tight sm:text-30px">
                    Your campus, <span className="vz-gradient-text">all in one place.</span>
                  </h1>
                  <p className="mt-1.5 max-w-md text-[12px] leading-relaxed text-muted">
                    Catch up on what matters, share something with campus, and keep your streak alive.
                  </p>
                </div>
                <span className="hidden lg:inline-flex rounded-full bg-accent px-3 py-1 text-[10px] font-semibold text-muted border border-border">
                  {today}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Link
                  href="/create"
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl vz-btn-glow bg-primary px-4 text-xs font-bold text-white shadow-lg shadow-primary/30 transition hover:bg-white/90"
                >
                  <Sparkles size={13} /> Share something
                </Link>
                <Link
                  href="/explore"
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-card px-4 text-xs font-semibold text-muted transition hover:bg-accent hover:text-foreground"
                >
                  Explore campus <ArrowRight size={13} />
                </Link>
              </div>

              <div className="mt-6 vz-stagger-appear grid grid-cols-2 gap-2 sm:grid-cols-4">
                <HeroStat icon={Sparkles} label="Level" value={`${data.stats.level}`} hint={data.stats.levelName} />
                <HeroStat icon={Trophy} label="Points" value={data.stats.xp.toLocaleString("en-IN")} hint={`${data.stats.xpToNext} to next`} />
                <HeroStat icon={Trophy} label="Rank" value={data.stats.rank ? `#${data.stats.rank}` : "—"} hint="This week" />
                <HeroStat icon={Flame} label="Streak" value={`${data.stats.streak}d`} hint={data.stats.streak > 0 ? "Keep it going" : "Start today"} />
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-[9px] font-medium text-muted">
                  <span>Level {data.stats.level}</span>
                  <span>{Math.round(data.stats.levelProgress * 100)}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-accent">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.max(4, Math.min(100, data.stats.levelProgress * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick access — glass cards with stagger */}
        <section className="vz-stagger-appear grid grid-cols-2 gap-2 sm:grid-cols-4">
          {quick.map((item, index) => (
            <MotionDiv
              key={item.href}
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Link
                href={item.href}
                className="vz-glass-card vz-card-hover group flex items-center gap-2.5 p-2.5"
              >
                <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${item.chip} vz-glow-inner`}>
                  <item.icon size={16} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[11px] font-bold">{item.label}</span>
                  <span className="block truncate text-[10px] text-muted">{item.detail}</span>
                </span>
                <ChevronRight size={13} className="ml-auto hidden shrink-0 text-muted-2 transition group-hover:text-primary sm:block" />
              </Link>
            </MotionDiv>
          ))}
        </section>

        {/* Feed */}
        <section className="flex flex-col gap-3">
          <div className="flex items-end justify-between gap-2">
            <SectionHeader title="Campus feed" description="What students are talking about right now" />
            <Link href="/explore" className="shrink-0 text-[11px] font-semibold text-primary hover:underline">
              Explore all
            </Link>
          </div>
          <Feed
            initialPosts={feed.posts}
            initialCursor={feed.nextCursor}
            viewer={me}
            composer
          />
        </section>
      </div>

      {/* Right rail */}
      <aside className="flex min-w-0 flex-col gap-3">
        {people.length > 0 ? (
          <MotionDiv
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.4 }}
          >
            <section className="vz-glass-card p-4">
              <SectionHeader
                title="Campus people"
                action={
                  <Link href="/explore" className="text-[10px] font-semibold text-primary hover:underline">
                    See all
                  </Link>
                }
              />
              <ul className="mt-3 flex flex-col gap-2.5">
                {people.map((person) => (
                  <li key={person.id}>
                    <Link href={`/u/${person.handle}`} className="group flex items-center gap-2.5">
                      <Avatar name={person.name} handle={person.handle} avatarUrl={person.avatarUrl} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[11px] font-semibold group-hover:text-primary">
                          {person.name}
                        </span>
                        <span className="block truncate text-[10px] text-muted">
                          @{person.handle}
                          {person.branch ? ` · ${person.branch}` : ""}
                          {person.year ? ` Y${person.year}` : ""}
                        </span>
                      </span>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">
                        View
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </MotionDiv>
        ) : null}

        {/* Announcements */}
        <MotionDiv
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <section className="vz-glass-card p-4">
            <SectionHeader
              title="Announcements"
              icon={<BellRing size={14} />}
              action={
                <Link href="/announcements" className="text-[10px] font-semibold text-primary hover:underline">
                  All
                </Link>
              }
            />
          {data.announcements.length === 0 ? (
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              No live announcements. Official updates will appear here.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2.5">
              {data.announcements.map((a) => (
                <li key={a.id}>
                  <Link href={`/announcements/${a.id}`} className="group block">
                    <div className="flex items-center gap-1.5">
                      {a.pinned ? <Badge tone="violet">Pinned</Badge> : null}
                      <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-2">
                        {a.category}
                      </span>
                      <span className="ml-auto text-[9px] text-muted-2">{a.publishLabel}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[11.5px] font-semibold leading-snug group-hover:text-primary">
                      {a.title}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          </section>
        </MotionDiv>

        {/* Events */}
        <MotionDiv
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <section className="vz-glass-card p-4">
          <SectionHeader
            title="Upcoming events"
            icon={<CalendarDays size={14} />}
            action={
              <Link href="/events" className="text-[10px] font-semibold text-primary hover:underline">
                All
              </Link>
            }
          />
          {data.events.length === 0 ? (
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              Nothing on the calendar yet. Check back soon.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {data.events.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/events/${e.id}`}
                    className="group flex items-center gap-2.5 rounded-xl border border-transparent p-1 transition hover:border-border hover:bg-accent/40"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 leading-none text-primary">
                      <span className="text-[8px] font-bold uppercase">{e.month}</span>
                      <span className="text-[13px] font-black">{e.day}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-semibold group-hover:text-primary">
                        {e.title}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1 truncate text-[9.5px] text-muted">
                        <MapPin size={9} /> {e.location ?? e.timeLabel}
                      </span>
                    </span>
                    <span className="shrink-0 text-[9px] font-medium text-muted">{e.going} going</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          </section>
        </MotionDiv>

        <PollWidget poll={data.poll} />

        {/* Notes */}
        <MotionDiv
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <section className="vz-glass-card p-4">
            <SectionHeader
              title="Notes & resources"
              icon={<BookOpen size={14} />}
              action={
                <Link href="/notes" className="text-[10px] font-semibold text-primary hover:underline">
                  Browse
                </Link>
              }
            />
          {data.notes.length === 0 ? (
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              No notes yet. Share the first resource from the notes page.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {data.notes.map((n) => (
                <li key={n.id}>
                  <Link
                    href={`/notes?q=${encodeURIComponent(n.title)}`}
                    className="group flex items-start gap-2.5"
                  >
                    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-cyan-500/10 text-cyan-700 dark:text-cyan-400">
                      <BookOpen size={13} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-semibold group-hover:text-primary">
                        {n.title}
                      </span>
                      <span className="block truncate text-[9.5px] text-muted">
                        {n.subject} · {n.uploader}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          </section>
        </MotionDiv>

        {/* Lost & found */}
        <MotionDiv
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <section className="vz-glass-card p-4">
            <SectionHeader
              title="Lost & found"
              icon={<PackageSearch size={14} />}
              action={
                <Link href="/lost-and-found" className="text-[10px] font-semibold text-primary hover:underline">
                  Open
                </Link>
              }
            />
          {data.lostFound.length === 0 ? (
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              No open items. Lost something? Post it and campus will help look.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {data.lostFound.map((item) => (
                <li key={item.id} className="flex items-center gap-2">
                  <span
                    className={`grid size-7 shrink-0 place-items-center rounded-lg ${
                      item.type === "lost"
                        ? "bg-danger/10 text-danger"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    <PackageSearch size={13} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11px] font-semibold">{item.itemName}</span>
                    <span className="block truncate text-[9.5px] text-muted">
                      {item.type === "lost" ? "Lost" : "Found"}
                      {item.location ? ` · ${item.location}` : ""}
                    </span>
                  </span>
                  <span className="shrink-0 text-[9px] text-muted-2">{item.createdLabel}</span>
                </li>
              ))}
            </ul>
          )}
          </section>
        </MotionDiv>

        {/* Mentors */}
        <MotionDiv
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <section className="vz-glass-card p-4">
            <SectionHeader
              title="Seniors Connect"
              icon={<GraduationCap size={14} />}
              action={
                <Link href="/mentorship" className="text-[10px] font-semibold text-primary hover:underline">
                  Find a mentor
                </Link>
              }
            />
          {data.seniors.length === 0 ? (
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              No seniors have set up mentoring yet. Check back as the community grows.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2.5">
              {data.seniors.map((s) => (
                <li key={s.id}>
                  <Link href={`/u/${s.handle}`} className="group flex items-center gap-2.5">
                    <Avatar name={s.name} handle={s.handle} avatarUrl={s.avatarUrl} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-semibold group-hover:text-primary">
                        {s.name}
                      </span>
                      <span className="block truncate text-[9.5px] text-muted">{s.branchLabel}</span>
                      {s.tags.length > 0 ? (
                        <span className="mt-0.5 flex flex-wrap gap-1">
                          {s.tags.slice(0, 2).map((t) => (
                            <span key={t} className="rounded-full bg-accent px-1.5 text-[8px] font-medium text-muted">
                              {t}
                            </span>
                          ))}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          </section>
        </MotionDiv>

        {/* Chat */}
        <MotionDiv
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <section className="vz-glass-card p-4">
            <SectionHeader
              title="Campus chat"
              icon={<Hash size={14} />}
              action={
                <Link href="/chat" className="text-[10px] font-semibold text-primary hover:underline">
                  Open
                </Link>
              }
            />
          {data.channels.length === 0 ? (
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              Channels will appear here once they&apos;re created.
            </p>
          ) : (
            <div className="mt-3 flex flex-col gap-3">
              {data.channels.map((c) => (
                <div key={c.id}>
                  <Link
                    href={`/chat/${c.slug}`}
                    className="flex items-center justify-between text-[11px] font-semibold hover:text-primary"
                  >
                    <span className="inline-flex items-center gap-1">
                      <Hash size={11} /> {c.name}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[9px] font-medium text-muted">
                      <Users size={9} /> {c.online}
                    </span>
                  </Link>
                  {c.messages.length === 0 ? (
                    <p className="mt-1 text-[10px] text-muted">No messages yet — say hello.</p>
                  ) : (
                    <ul className="mt-1 flex flex-col gap-1">
                      {c.messages.slice(-2).map((m, i) => (
                        <li key={`${c.id}-${i}`} className="truncate text-[10px] text-muted">
                          <span className="font-semibold text-foreground">{m.name}</span> {m.body}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
          </section>
        </MotionDiv>

        <MotionDiv
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <section className="vz-glass-card vz-soft-gradient p-4">
            <div className="flex items-center gap-2 text-[11px] font-bold">
              <Vote size={13} className="text-primary" /> Earn campus points
            </div>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-muted">
              Post, comment, vote, RSVP and share notes to climb the weekly leaderboard.
            </p>
            <Link
              href="/leaderboard"
              className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline"
            >
              View leaderboard <ArrowRight size={10} />
            </Link>
          </section>
        </MotionDiv>
      </aside>
    </div>
  );
}

function HeroStat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="vz-glass-card rounded-xl p-2.5 vz-glow-inner">
      <p className="flex items-center gap-1 text-[9px] font-medium uppercase tracking-wide text-primary">
        <Icon size={10} /> {label}
      </p>
      <p className="mt-0.5 text-base font-black leading-none">{value}</p>
      <p className="mt-0.5 truncate text-[8.5px] text-muted">{hint}</p>
    </div>
  );
}

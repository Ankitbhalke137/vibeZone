import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Compass,
  Clock,
  Hash,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { listPosts } from "@/lib/posts";
import { Avatar } from "@/components/avatar";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { Feed } from "@/components/feed/feed";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/form";
import { cn } from "@/lib/utils";

const BRANCHES = ["CSE", "IT", "ECE", "EEE", "ME", "CE", "Other"];
const YEARS = [1, 2, 3, 4];

export const dynamic = "force-dynamic";
export const metadata = { title: "Explore" };

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; branch?: string; year?: string }>;
}) {
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/explore");

  const { q, branch, year } = await searchParams;
  const query = q?.trim() ?? "";
  const branchFilter = branch?.trim() ?? "";
  const yearFilter = year?.trim() ?? "";

  const yearNum = yearFilter ? Number(yearFilter) : NaN;

  const [feed, people, notes, events, tagRows, distinctBranches, distinctYears] =
    await Promise.all([
      listPosts({ viewerId: me.id, query, take: 10, limitComments: 2 }),
      db.user
        .findMany({
          where: {
            status: "active",
            id: { not: me.id },
            ...(query
              ? {
                  OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { handle: { contains: query, mode: "insensitive" } },
                    { branch: { contains: query, mode: "insensitive" } },
                  ],
                }
              : {}),
            ...(branchFilter ? { branch: branchFilter } : {}),
            ...(Number.isFinite(yearNum) ? { year: yearNum } : {}),
          },
          orderBy: { createdAt: "desc" },
          take: 12,
          select: {
            id: true,
            name: true,
            handle: true,
            avatarUrl: true,
            branch: true,
            year: true,
            role: true,
            lastSeenAt: true,
          },
        })
        .catch(() => []),
      query
        ? db.note.findMany({
            where: {
              removedAt: null,
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { subject: { contains: query, mode: "insensitive" } },
              ],
            },
            orderBy: { openCount: "desc" },
            take: 5,
            select: { id: true, title: true, subject: true, type: true, openCount: true },
          })
        : Promise.resolve([]),
      query
        ? db.event.findMany({
            where: {
              status: "published",
              title: { contains: query, mode: "insensitive" },
              startsAt: { gte: new Date(Date.now() - 12 * 3_600_000) },
            },
            orderBy: { startsAt: "asc" },
            take: 4,
            select: { id: true, title: true, startsAt: true, location: true },
          })
        : Promise.resolve([]),
      db.post
        .findMany({
          where: { deletedAt: null, createdAt: { gte: new Date(Date.now() - 30 * 86_400_000) } },
          select: { tags: true },
          take: 100,
        })
        .catch(() => []),
      db.user.findMany({
        where: { status: "active", branch: { not: null } },
        select: { branch: true },
        distinct: ["branch"],
      }).catch(() => []),
      db.user.findMany({
        where: { status: "active", year: { not: null } },
        select: { year: true },
        distinct: ["year"],
      }).catch(() => []),
    ]);

  const tagCount = new Map<string, number>();
  for (const row of tagRows) {
    for (const tag of row.tags) {
      tagCount.set(tag, (tagCount.get(tag) ?? 0) + 1);
    }
  }
  const trending = [...tagCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag, count]) => ({ tag, count }));

  const availableBranches = [
    ...new Set(
      (distinctBranches as { branch: string | null }[])
        .map((b) => b.branch)
        .filter((b): b is string => b !== null),
    ),
  ].sort();
  const availableYears = [
    ...new Set(
      (distinctYears as { year: number | null }[])
        .map((y) => y.year)
        .filter((y): y is number => y !== null),
    ),
  ].sort((a, b) => a - b);

  /** Human-friendly "last active" label from a timestamp. */
  function lastActiveLabel(lastSeenAt: Date | null): string {
    if (!lastSeenAt) return "Not active yet";
    const now = Date.now();
    const diff = now - lastSeenAt.getTime();
    const min = Math.floor(diff / 60_000);
    if (min < 1) return "Active now";
    if (min < 60) return `Active ${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `Active ${hr}h ago`;
    const day = Math.floor(hr / 24);
    if (day === 1) return "Active yesterday";
    if (day < 7) return `Active ${day}d ago`;
    return lastSeenAt.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="Discover"
        title="Explore campus"
        description="Search posts, people, notes and events across VibeZone."
      />

      <form action="/explore" method="get" className="vz-panel flex flex-wrap items-center gap-2 p-2">
        <Search size={16} className="ml-1.5 shrink-0 text-muted-2" />
        <input
          name="q"
          defaultValue={query}
          placeholder="Search people, topics, tags, notes, events…"
          aria-label="Search campus"
          className="h-9 min-w-[150px] flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-2"
        />
        <Select
          name="branch"
          defaultValue={branchFilter || undefined}
          onChange={(e) => {
            const form = e.target.form;
            if (form) form.requestSubmit();
          }}
          className="h-9 w-auto text-[11px] bg-transparent border-none outline-none"
        >
          <option value="">All branches</option>
          {availableBranches.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Select>
        <Select
          name="year"
          defaultValue={yearFilter || undefined}
          onChange={(e) => {
            const form = e.target.form;
            if (form) form.requestSubmit();
          }}
          className="h-9 w-auto text-[11px] bg-transparent border-none outline-none"
        >
          <option value="">All years</option>
          {availableYears.map((y) => (
            <option key={y} value={String(y)}>
              Year {y}
            </option>
          ))}
        </Select>
        {(query || branchFilter || yearFilter) ? (
          <Link
            href="/explore"
            className="rounded-lg px-2 py-1 text-[11px] font-semibold text-muted hover:text-foreground"
          >
            Clear
          </Link>
        ) : null}
        <button
          type="submit"
          className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-bold text-white transition hover:brightness-110"
        >
          Search
        </button>
      </form>

      {!query && !branchFilter && !yearFilter && trending.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-muted-2">
            <Sparkles size={11} /> Trending
          </span>
          {trending.map(({ tag, count }) => (
            <Link
              key={tag}
              href={`/explore?q=${encodeURIComponent(tag)}`}
              className="rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-semibold text-muted transition hover:border-primary/40 hover:text-primary"
            >
              #{tag} <span className="text-muted-2">{count}</span>
            </Link>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <SectionHeader
              title={query ? `Posts matching “${query}”` : "Campus feed"}
              description={query ? undefined : "Everything shared across campus"}
            />
            <Badge tone="violet" className="normal-case tracking-normal">
              <Compass size={10} /> {feed.posts.length}
            </Badge>
          </div>
          <Feed
            initialPosts={feed.posts}
            initialCursor={feed.nextCursor}
            viewer={me}
            query={query || undefined}
            emptyTitle={query ? "No posts match that search" : "The feed is quiet"}
            emptyDescription={
              query
                ? "Try a shorter keyword, a person's handle, or a trending tag."
                : "Be the first to start a conversation from the home feed."
            }
          />
        </div>

        <aside className="flex min-w-0 flex-col gap-3">
          <section className="vz-panel p-4">
            <SectionHeader
              title={query ? "People" : "Find your people"}
              icon={<Users size={14} />}
              description={
                query
                  ? undefined
                  : "Search a handle, branch or interest to find classmates and seniors."
              }
              action={
                <Link href="/leaderboard" className="text-[10px] font-semibold text-primary hover:underline">
                  Top users
                </Link>
              }
            />

            {/* Branch / year quick filters (shown when not searching) */}
            {!query && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["CSE", "IT", "ECE", "Placements", "DSA", "Hostel"].map((term) => (
                  <Link
                    key={term}
                    href={`/explore?q=${encodeURIComponent(term)}`}
                    className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted transition hover:border-primary/40 hover:text-primary"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            )}

            {people.length === 0 ? (
              <p className="mt-3 text-[11px] leading-relaxed text-muted">
                No people match that search.
              </p>
            ) : (
              <div className="mt-3 grid gap-2.5">
                {people.map((person) => (
                  <Link
                    key={person.id}
                    href={`/u/${person.handle}`}
                    className="vz-panel vz-card-hover group flex flex-col p-3"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          name={person.name}
                          handle={person.handle}
                          avatarUrl={person.avatarUrl}
                          size="sm"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[11px] font-semibold group-hover:text-primary">
                            {person.name}
                          </span>
                          <span className="block truncate text-[10px] text-muted">
                            @{person.handle}
                            {person.branch ? ` · ${person.branch}` : ""}
                            {person.year ? ` · Y${person.year}` : ""}
                          </span>
                        </span>
                      </div>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold",
                          person.lastSeenAt &&
                            Date.now() - person.lastSeenAt.getTime() < 5 * 60_000
                            ? "bg-success/10 text-success"
                            : "bg-accent text-muted",
                        )}
                      >
                        <Clock size={9} className="shrink-0" />
                        {lastActiveLabel(person.lastSeenAt)}
                      </span>
                    </div>
                    <div className="w-full flex items-center justify-between pt-1.5 border-t border-[var(--vz-border-soft)]">
                      <span className="text-[9px] text-muted-2 uppercase tracking-wide">
                        {person.role.charAt(0).toUpperCase() + person.role.slice(1)}
                      </span>
                      <ArrowRight size={11} className="text-muted-2 group-hover:text-primary" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {query ? (
            <>
              <section className="vz-panel p-4">
                <SectionHeader title="Notes" icon={<BookOpen size={14} />} />
                {notes.length === 0 ? (
                  <p className="mt-3 text-[11px] text-muted">No notes match that search.</p>
                ) : (
                  <ul className="mt-3 flex flex-col gap-2">
                    {notes.map((note) => (
                      <li key={note.id}>
                        <Link href={`/notes?q=${encodeURIComponent(note.title)}`} className="group block">
                          <p className="truncate text-[11px] font-semibold group-hover:text-primary">{note.title}</p>
                          <p className="truncate text-[9.5px] text-muted">
                            {note.subject} · {note.type} · {note.openCount} opens
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="vz-panel p-4">
                <SectionHeader title="Events" icon={<CalendarDays size={14} />} />
                {events.length === 0 ? (
                  <p className="mt-3 text-[11px] text-muted">No events match that search.</p>
                ) : (
                  <ul className="mt-3 flex flex-col gap-2">
                    {events.map((event) => (
                      <li key={event.id}>
                        <Link href={`/events/${event.id}`} className="group block">
                          <p className="truncate text-[11px] font-semibold group-hover:text-primary">{event.title}</p>
                          <p className="truncate text-[9.5px] text-muted">
                            {event.startsAt.toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                            {event.location ? ` · ${event.location}` : ""}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

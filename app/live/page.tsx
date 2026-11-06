import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, ExternalLink, PlayCircle, Radio, Users, Video } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatIST, formatISTTime } from "@/lib/time";
import { timeAgo } from "@/lib/format";
import { Avatar } from "@/components/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Live",
  description: "Live campus broadcasts, sessions, and gaming tournaments.",
};

function embedUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}?autoplay=1&rel=0`;
    }
    if (parsed.hostname.endsWith("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
      if (parsed.pathname.startsWith("/embed/")) return url;
      if (parsed.pathname.startsWith("/live/")) {
        return `https://www.youtube.com/embed/${parsed.pathname.split("/").pop()}?autoplay=1&rel=0`;
      }
    }
    return url;
  } catch {
    return url;
  }
}

export default async function LivePage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/live");

  const now = new Date();
  const broadcasts = await db.broadcast
    .findMany({
      orderBy: { startsAt: "desc" },
      take: 40,
      include: { host: { select: { id: true, name: true, handle: true, avatarUrl: true } } },
    })
    .catch(() => []);

  const live = broadcasts.find((b) => b.status === "live") ?? null;
  const upcoming = broadcasts
    .filter((b) => b.status === "upcoming")
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  const past = broadcasts.filter((b) => b.status === "ended");

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <PageHeader
        eyebrow="Broadcast"
        title="VibeZone Live"
        description="Live campus broadcasts, guest sessions, club showcases, and gaming tournaments."
        actions={
          <Badge tone={live ? "red" : "neutral"} className="normal-case tracking-normal">
            <span className={`size-1.5 rounded-full ${live ? "animate-pulse bg-danger" : "bg-muted"}`} />
            {live ? "On air" : "Off air"}
          </Badge>
        }
      />

      {live ? (
        <section className="vz-panel overflow-hidden">
          <div className="relative aspect-video w-full bg-black">
            {live.status === "live" && /youtube|youtu\.be/.test(live.streamUrl) ? (
              <iframe
                src={embedUrl(live.streamUrl)}
                title={live.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 size-full"
              />
            ) : (
              <video
                src={live.streamUrl}
                poster={live.thumbnailUrl ?? undefined}
                controls
                autoPlay
                playsInline
                className="absolute inset-0 size-full object-contain"
              />
            )}
          </div>
          <div className="flex flex-col gap-3 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="red" className="normal-case tracking-normal">
                <Radio size={10} /> Live now
              </Badge>
              <Badge tone="neutral" className="normal-case tracking-normal">
                <Users size={10} /> {live.viewerCount.toLocaleString("en-IN")} watching
              </Badge>
            </div>
            <h2 className="text-lg font-bold tracking-tight">{live.title}</h2>
            {live.description ? (
              <p className="text-[12.5px] leading-relaxed text-muted">{live.description}</p>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
              <div className="flex items-center gap-2.5">
                <Avatar name={live.host.name} handle={live.host.handle} avatarUrl={live.host.avatarUrl} size="sm" />
                <div className="text-[10px] text-muted">
                  <p className="font-semibold text-foreground">{live.host.name}</p>
                  <p>Started {timeAgo(live.startsAt)} ago · {formatISTTime(live.startsAt)} IST</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href="/chat/general">
                  <Button size="sm" variant="secondary">Join the chat</Button>
                </Link>
                <a href={live.streamUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="soft">
                    Open stream <ExternalLink size={12} />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="vz-hero relative overflow-hidden rounded-3xl p-6 text-white">
          <div className="vz-hero-glow pointer-events-none absolute inset-0" />
          <div className="relative flex max-w-xl flex-col gap-3">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">
              <Video size={12} /> Studio
            </span>
            <h2 className="text-2xl font-black leading-tight tracking-tight">
              Nothing is streaming right now.
            </h2>
            <p className="text-sm text-white/80">
              The next campus broadcast will appear here automatically when it goes live.
              {upcoming[0] ? ` Up next: ${upcoming[0].title}.` : ""}
            </p>
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold tracking-tight">Coming up</h2>
        {upcoming.length === 0 ? (
          <EmptyState
            icon={<CalendarDays size={22} />}
            title="No scheduled broadcasts"
            description="Check back soon — moderators schedule sessions every week."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {upcoming.map((b) => (
              <article key={b.id} className="vz-panel flex flex-col gap-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge tone="violet" className="normal-case tracking-normal">Upcoming</Badge>
                  <span className="text-[10px] font-medium text-muted">
                    {formatIST(b.startsAt)} · {formatISTTime(b.startsAt)} IST
                  </span>
                </div>
                <h3 className="text-sm font-bold leading-snug">{b.title}</h3>
                {b.description ? (
                  <p className="line-clamp-2 text-[11.5px] leading-relaxed text-muted">{b.description}</p>
                ) : null}
                <div className="mt-auto flex items-center gap-2 pt-2 text-[10px] text-muted">
                  <Avatar name={b.host.name} handle={b.host.handle} avatarUrl={b.host.avatarUrl} size="xs" />
                  Hosted by @{b.host.handle}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {past.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-bold tracking-tight">Past broadcasts</h2>
          <div className="flex flex-col gap-2">
            {past.map((b) => (
              <a
                key={b.id}
                href={b.streamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/30"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <PlayCircle size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{b.title}</p>
                  <p className="text-[10px] text-muted">
                    {formatIST(b.startsAt)} · hosted by @{b.host.handle}
                  </p>
                </div>
                <ExternalLink size={14} className="shrink-0 text-muted" />
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

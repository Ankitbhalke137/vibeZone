import Link from "next/link";
import { Flame, MessageSquare, Vote } from "lucide-react";
import type { DashStats, DashUser } from "@/lib/dashboard-data";

function istGreeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      hour12: false,
    }).format(new Date()),
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-white/10 px-2.5 py-2 backdrop-blur">
      <p className="text-[8px] font-medium uppercase tracking-wider text-white/60">{label}</p>
      <p className="text-lg font-bold leading-tight">{value}</p>
    </div>
  );
}

export function Hero({
  user,
  stats,
  newAnnouncements,
}: {
  user: DashUser;
  stats: DashStats;
  newAnnouncements: number;
}) {
  const firstName = user.name.split(" ")[0] || "there";
  const greeting = istGreeting();
  const progress = Math.max(6, Math.min(100, stats.levelProgress * 100));

  return (
    <section className="vz-hero relative overflow-hidden rounded-2xl px-4 py-5 text-white sm:px-6 sm:py-6">
      <div className="vz-hero-glow pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-white/10 blur-3xl" />

      <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-medium backdrop-blur">
            <Flame size={11} className="text-amber-300" />
            {stats.streak}-day streak · keep it going
          </span>

          <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight sm:text-[28px]">
            {greeting}, {firstName}.
            <br />
            <span className="text-white/90">Campus is buzzing tonight.</span>
          </h1>

          <p className="mt-2 max-w-md text-[12px] leading-relaxed text-white/75">
            {newAnnouncements} new announcements, a live tournament, and today&apos;s poll is waiting
            for your vote — <span className="font-semibold text-amber-300">+50 XP</span> for voting.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Link
              href="/polls"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-[11px] font-semibold text-[#4c1d95] shadow-sm transition hover:bg-white/90"
            >
              <Vote size={13} /> View tonight&apos;s poll
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3.5 py-2 text-[11px] font-semibold text-white backdrop-blur transition hover:bg-white/25"
            >
              <MessageSquare size={13} /> Chat as alias
            </Link>
          </div>
        </div>

        <div className="grid w-full grid-cols-3 gap-2 sm:gap-3 xl:w-[320px]">
          <Stat label="XP" value={stats.xp.toLocaleString("en-IN")} />
          <Stat label="Rank" value={stats.rank ? `#${stats.rank}` : "—"} />
          <Stat label="Level" value={stats.level} />
          <div className="col-span-3 mt-0.5">
            <div className="flex items-center justify-between text-[9px] text-white/70">
              <span>
                Level {stats.level} · {stats.levelName}
              </span>
              <span>{stats.xpToNext} XP to go</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-white"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

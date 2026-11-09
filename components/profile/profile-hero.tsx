"use client";

import { motion } from "framer-motion";
import {
  CalendarDays,
  GraduationCap,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ROLE_TONE: Record<string, BadgeTone> = {
  student: "neutral",
  senior: "cyan",
  club_leader: "amber",
  moderator: "violet",
  faculty: "fuchsia",
  admin: "magenta",
};

const ROLE_LABEL: Record<string, string> = {
  student: "Student",
  senior: "Senior",
  club_leader: "Club Leader",
  moderator: "Moderator",
  faculty: "Faculty",
  admin: "Admin",
};

export type ProfileStat = {
  label: string;
  value: string | number;
  hint?: string;
};

export function ProfileHero({
  name,
  handle,
  avatarUrl,
  role,
  bio,
  branch,
  year,
  joinedLabel,
  expertise = [],
  action,
  stats,
  eyebrow = "Campus member",
}: {
  name: string;
  handle: string;
  avatarUrl: string | null;
  role: string;
  bio: string | null;
  branch: string | null;
  year: number | null;
  joinedLabel?: string;
  expertise?: string[];
  action?: React.ReactNode;
  stats: ProfileStat[];
  eyebrow?: string;
}) {
  return (
    <section className="vz-glass-card overflow-hidden">
      {/* Hero banner */}
      <div className="vz-hero relative h-28 sm:h-36">
        <div className="vz-hero-glow pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -right-8 -top-10 size-40 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-16 left-1/4 size-44 rounded-full border border-white/10" />
        <p className="absolute right-4 top-3 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[9px] font-semibold text-white/80 backdrop-blur">
          {eyebrow}
        </p>
      </div>

      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <div className="-mt-10 flex items-end justify-between gap-3 sm:-mt-12">
          <div className="relative z-10">
            <Avatar name={name} handle={handle} avatarUrl={avatarUrl} size="xl" className="ring-4 ring-[var(--vz-card)] transition-transform duration-300 hover:scale-105" />
          </div>
          {action ? <div className="mb-1 shrink-0">{action}</div> : null}
        </div>

        <div className="mt-2.5 flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h1 className="truncate text-xl font-black tracking-tight sm:text-2xl">{name}</h1>
              <Badge tone={ROLE_TONE[role] ?? "neutral"} className="normal-case tracking-normal">
                {role === "moderator" || role === "admin" || role === "faculty" ? (
                  <ShieldCheck size={9} />
                ) : null}
                {ROLE_LABEL[role] ?? role}
              </Badge>
            </div>
            <p className="mt-0.5 text-[11px] text-muted">@{handle}</p>
          </div>
        </div>

        {bio ? (
          <p className="mt-2.5 max-w-2xl text-[11.5px] leading-relaxed text-muted">{bio}</p>
        ) : (
          <p className="mt-2.5 text-[11px] italic text-muted-2">No bio yet.</p>
        )}

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted">
          {branch ? (
            <span className="inline-flex items-center gap-1">
              <GraduationCap size={10} /> {branch}
              {year ? ` · Year ${year}` : ""}
            </span>
          ) : null}
          {year && !branch ? (
            <span className="inline-flex items-center gap-1">
              <GraduationCap size={10} /> Year {year}
            </span>
          ) : null}
          {joinedLabel ? (
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={10} /> Joined {joinedLabel}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <MapPin size={10} /> PW IOI campus
          </span>
        </div>

        {expertise.length > 0 ? (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {expertise.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-[var(--vz-card-2)] px-2 py-0.5 text-[9px] font-semibold text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-3 sm:grid-cols-4"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -2 }}
              className="vz-glow-inner rounded-xl bg-[var(--vz-card-2)] px-2.5 py-2"
            >
              <dt className="text-[8.5px] font-bold uppercase tracking-wide text-muted-2">
                {stat.label}
              </dt>
              <dd className="mt-0.5 text-base font-black leading-none">{stat.value}</dd>
              {stat.hint ? <p className="mt-0.5 text-[8.5px] text-muted">{stat.hint}</p> : null}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

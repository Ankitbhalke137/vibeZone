"use client";

import Link from "next/link";
import { useState } from "react";
import { MapPin, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashCard, LiveBadge, SectionTitle } from "./ui";

type Kind = "event" | "live" | "found" | "empty";

const TILES: { name: string; kind: Kind; label: string }[] = [
  { name: "Academic Block A", kind: "event", label: "Mid-sem schedule" },
  { name: "Seminar Hall", kind: "live", label: "Placement AMA" },
  { name: "Sports Ground", kind: "event", label: "Football trials" },
  { name: "Innovation Lab", kind: "event", label: "Hackathon" },
  { name: "Hostel B & C", kind: "found", label: "Found: earbuds" },
  { name: "Central Library", kind: "event", label: "Open till 2 AM" },
  { name: "Canteen", kind: "live", label: "Open mic" },
  { name: "Mech Workshop", kind: "empty", label: "" },
];

const PIN: Record<Kind, string> = {
  event: "bg-[var(--vz-violet)] shadow-[0_0_0_4px_rgba(124,92,255,0.15)]",
  live: "bg-[var(--vz-red)] shadow-[0_0_0_4px_rgba(248,113,113,0.15)]",
  found: "bg-[var(--vz-amber)] shadow-[0_0_0_4px_rgba(251,191,36,0.15)]",
  empty: "bg-transparent",
};

const TABS = ["All", "Events", "Live", "Lost & Found"] as const;

export function Happenings() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");

  const matches = (kind: Kind) => {
    if (tab === "All") return kind !== "empty";
    if (tab === "Events") return kind === "event";
    if (tab === "Live") return kind === "live";
    return kind === "found";
  };

  return (
    <DashCard className="p-4">
      <div className="flex flex-wrap items-center gap-2">
        <SectionTitle
          icon={<MapPin size={14} />}
          title={
            <span className="flex items-center gap-1.5">
              Happenings <LiveBadge />
            </span>
          }
          subtitle="What's going on across campus right now"
        />
      </div>

      <div className="vz-no-scrollbar mt-3 flex gap-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-semibold transition",
              tab === t
                ? "bg-[var(--vz-violet)] text-white"
                : "bg-[var(--vz-card-2)] text-[var(--vz-muted)] hover:text-white",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="vz-map mt-3 grid grid-cols-2 gap-2 rounded-xl border border-[var(--vz-border-soft)] bg-[var(--vz-card)] p-2 sm:grid-cols-4">
        {TILES.map((tile) => {
          const show = matches(tile.kind);
          return (
            <div
              key={tile.name}
              className="relative flex h-16 flex-col justify-between overflow-hidden rounded-lg border border-[var(--vz-border-soft)] bg-[var(--vz-card-2)] p-2"
            >
              <span className="truncate text-[8px] font-medium text-[var(--vz-muted-2)]">{tile.name}</span>
              {show ? (
                <span className="flex items-center gap-1.5">
                  <span className={cn("size-2.5 shrink-0 rounded-full", PIN[tile.kind])} />
                  <span className="truncate text-[8px] text-[var(--vz-muted)]">{tile.label}</span>
                </span>
              ) : (
                <span className="text-[8px] text-[var(--vz-muted-2)]">—</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--vz-border)] bg-[var(--vz-card-2)] px-3 py-2">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[var(--vz-violet)]/15 text-[var(--vz-violet-2)]">
          <Radio size={13} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-semibold">Valorant Campus Cup — Semi Finals</p>
          <p className="text-[8px] text-[var(--vz-muted)]">Seminar Hall · 7:00 PM · 2.4k watching</p>
        </div>
        <div className="hidden items-center gap-2 text-[8px] text-[var(--vz-muted)] sm:flex">
          <span className="flex items-center gap-1">
            <span className="size-1 rounded-full bg-[var(--vz-red)]" /> 1 Live
          </span>
          <span className="flex items-center gap-1">
            <span className="size-1 rounded-full bg-[var(--vz-violet)]" /> 2 events
          </span>
          <span className="flex items-center gap-1">
            <span className="size-1 rounded-full bg-[var(--vz-amber)]" /> 1 found
          </span>
        </div>
        <Link
          href="/events"
          className="shrink-0 rounded-lg bg-[var(--vz-violet)] px-2.5 py-1 text-[9px] font-semibold text-white transition hover:opacity-90"
        >
          Directions
        </Link>
      </div>
      <p className="mt-1.5 text-center text-[8px] text-[var(--vz-muted-2)]">Top 3 pins for details</p>
    </DashCard>
  );
}

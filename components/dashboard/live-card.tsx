import Link from "next/link";
import { Play } from "lucide-react";
import { AvatarStack, DashCard, LiveBadge } from "./ui";

const WATCHERS = [
  { name: "Aarav", avatarUrl: "preset:grape" },
  { name: "Riya", avatarUrl: "preset:rose" },
  { name: "Kabir", avatarUrl: "preset:ocean" },
  { name: "Sana", avatarUrl: "preset:sunset" },
];

export function LiveCard() {
  return (
    <DashCard className="flex h-full flex-col overflow-hidden">
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-[#1a0b2e] via-[#2a0f4a] to-[#08080f] sm:h-44">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(168,85,247,0.5),transparent_62%)]" />
        <div className="vz-map absolute inset-0 opacity-40" />
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <LiveBadge />
          <span className="rounded-md bg-black/40 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur">
            Gaming Club
          </span>
        </div>
        <div className="absolute inset-0 grid place-items-center">
          <Link
            href="/events"
            aria-label="Watch the live stream"
            className="grid size-12 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur transition hover:scale-105 hover:bg-white/25"
          >
            <Play size={18} className="ml-0.5" fill="currentColor" />
          </Link>
        </div>
        <div className="absolute inset-x-3 bottom-2 flex items-center justify-between">
          <span className="text-[8px] font-semibold uppercase tracking-wider text-white/70">
            Broadcast · Gaming Club
          </span>
          <span className="rounded-md bg-red-500/20 px-1.5 py-0.5 text-[8px] font-bold text-red-300">
            2.4k watching
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[15px] font-semibold leading-snug">Valorant Campus Cup — Semi Finals</h3>
        <p className="mt-0.5 text-[11px] text-[var(--vz-muted)]">CSE Phantoms vs ECE Voltage · Map 2 of 3</p>
        <div className="mt-auto flex items-center gap-2 pt-3">
          <AvatarStack names={WATCHERS} extra={12} />
          <p className="truncate text-[9px] text-[var(--vz-muted)]">
            Up next: <span className="font-medium text-[var(--vz-text)]">Placement AMA with Seniors</span> · 8 PM
          </p>
        </div>
      </div>
    </DashCard>
  );
}

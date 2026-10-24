import { CalendarDays } from "lucide-react";

/** Temporary page shown until the module ships (Week 4 — events, plan §3). */
export function ComingSoon({ title, week, desc }: { title: string; week: string; desc: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-accent text-primary">
        <CalendarDays size={22} aria-hidden />
      </span>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="max-w-sm text-sm text-muted">{desc}</p>
      <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-primary">
        Ships in {week}
      </span>
    </div>
  );
}

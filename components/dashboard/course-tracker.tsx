"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarClock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashCard, SectionTitle } from "./ui";

type Tone = "red" | "amber" | "violet" | "green";

const DEADLINES: { title: string; course: string; due: string; tone: Tone }[] = [
  { title: "Assignment 3 — Submission", course: "Computer Networks", due: "1h left", tone: "red" },
  { title: "Lab Record — Graph Algorithms", course: "Data Structures", due: "2 days", tone: "amber" },
  { title: "Quiz 2 — Process Scheduling", course: "Operating Systems", due: "Mar 18", tone: "violet" },
  { title: "Tutorial Sheet 4", course: "Maths III", due: "Done", tone: "green" },
];

const BAR: Record<Tone, string> = {
  red: "bg-[var(--vz-red)]",
  amber: "bg-[var(--vz-amber)]",
  violet: "bg-[var(--vz-violet)]",
  green: "bg-[var(--vz-green)]",
};

const DUE: Record<Tone, string> = {
  red: "bg-[var(--vz-red)]/15 text-[var(--vz-red)]",
  amber: "bg-[var(--vz-amber)]/15 text-[var(--vz-amber)]",
  violet: "bg-[var(--vz-violet)]/15 text-[var(--vz-violet-2)]",
  green: "bg-[var(--vz-green)]/15 text-[var(--vz-green)]",
};

export function CourseTracker() {
  const [remind, setRemind] = useState(true);

  return (
    <DashCard className="p-4">
      <SectionTitle
        icon={<CalendarClock size={14} />}
        title="Course Tracker"
        subtitle="Synced with campus portal · 4 min ago"
        action={<RefreshCw size={13} className="text-[var(--vz-muted-2)]" />}
      />

      <div className="mt-3 rounded-xl border border-[var(--vz-violet)]/30 bg-[var(--vz-violet)]/10 p-3">
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--vz-violet-2)]">
            Next lecture · Tomorrow
          </span>
          <span className="text-[10px] font-semibold">9:00 AM</span>
        </div>
        <h3 className="mt-1 text-[13px] font-semibold">Database Management Systems</h3>
        <p className="text-[10px] text-[var(--vz-muted)]">Room CS-204 · Prof. Kulkarni</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[9px] text-[var(--vz-muted)]">Remind me 15 min before</span>
          <button
            type="button"
            role="switch"
            aria-checked={remind}
            aria-label="Remind me 15 minutes before"
            onClick={() => setRemind((v) => !v)}
            className={cn(
              "relative h-4 w-8 rounded-full transition",
              remind ? "bg-[var(--vz-violet)]" : "bg-[var(--vz-card-3)]",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-3 rounded-full bg-white shadow transition-all",
                remind ? "left-4" : "left-0.5",
              )}
            />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <h3 className="text-[10px] font-semibold text-[var(--vz-muted)]">Upcoming deadlines</h3>
        <span className="text-[9px] text-[var(--vz-muted-2)]">4 this week</span>
      </div>

      <ul className="mt-2 flex flex-col gap-1.5">
        {DEADLINES.map((d) => (
          <li
            key={d.title}
            className="flex items-center gap-2 rounded-lg border border-[var(--vz-border-soft)] bg-[var(--vz-card-2)] px-2 py-1.5"
          >
            <span className={cn("h-7 w-0.5 shrink-0 rounded-full", BAR[d.tone])} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-medium">{d.title}</p>
              <p className="truncate text-[8px] text-[var(--vz-muted)]">{d.course}</p>
            </div>
            <span className={cn("shrink-0 rounded-md px-1.5 py-0.5 text-[8px] font-semibold", DUE[d.tone])}>
              {d.due}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href="/events"
        className="mt-3 flex items-center justify-center gap-1 text-[9px] font-medium text-[var(--vz-violet-2)] hover:underline"
      >
        Open full timetable →
      </Link>
    </DashCard>
  );
}

import Link from "next/link";
import { ArrowUpRight, GraduationCap } from "lucide-react";
import type { DashSenior } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";
import { DashAvatar, DashCard, SectionTitle } from "./ui";

export function SeniorsConnect({ seniors }: { seniors: DashSenior[] }) {
  return (
    <DashCard className="p-4">
      <SectionTitle
        icon={<GraduationCap size={14} />}
        title="Seniors Connect"
        subtitle="Matched for you on academics, career & campus life"
        action={
          <Link href="/mentorship" className="text-[9px] font-medium text-[var(--vz-violet-2)] hover:underline">
            Find a mentor
          </Link>
        }
      />

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {seniors.map((s) => {
          const pending = s.requestStatus === "pending";
          return (
            <div
              key={s.id}
              className="flex flex-col rounded-xl border border-[var(--vz-border-soft)] bg-[var(--vz-card-2)] p-3"
            >
              <div className="flex items-center gap-2">
                <DashAvatar name={s.name} avatarUrl={s.avatarUrl} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-semibold">{s.name}</p>
                  <p className="truncate text-[8px] text-[var(--vz-muted)]">{s.branchLabel}</p>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-1">
                {s.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-[var(--vz-card-3)] px-1.5 py-0.5 text-[8px] text-[var(--vz-muted)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <Link
                href="/mentorship"
                className={cn(
                  "mt-2.5 flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[9px] font-semibold transition",
                  pending
                    ? "bg-[var(--vz-amber)]/15 text-[var(--vz-amber)]"
                    : "bg-[var(--vz-violet)] text-white hover:opacity-90",
                )}
              >
                {pending ? "Request pending" : "Request mentorship"}
                {!pending ? <ArrowUpRight size={10} /> : null}
              </Link>
            </div>
          );
        })}
      </div>
    </DashCard>
  );
}

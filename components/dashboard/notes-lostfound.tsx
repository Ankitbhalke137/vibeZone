import Link from "next/link";
import { BookOpen, FileText, FolderSearch, PackageSearch, Plus, Upload } from "lucide-react";
import type { DashLostFound, DashNote } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";
import { DashCard, Pill, SectionTitle } from "./ui";

const SUBJECTS = ["DSA", "DBMS", "Operating Systems", "Computer Networks"];

export function NotesLostFound({
  notes,
  lostFound,
}: {
  notes: DashNote[];
  lostFound: DashLostFound[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Notes */}
      <DashCard className="p-4">
        <SectionTitle
          icon={<BookOpen size={14} />}
          title="Notes Repository"
          subtitle="Subject-wise notes, all straight in Google Drive"
          action={
            <Link
              href="/notes"
              className="inline-flex items-center gap-1 rounded-lg bg-[var(--vz-card-2)] px-2 py-1 text-[9px] font-medium text-[var(--vz-muted)] transition hover:text-white"
            >
              <Upload size={9} /> Share a Drive link
            </Link>
          }
        />

        <div className="vz-no-scrollbar mt-3 flex gap-1 overflow-x-auto">
          {SUBJECTS.map((s, i) => (
            <span
              key={s}
              className={cn(
                "shrink-0 rounded-lg px-2 py-1 text-[9px] font-semibold",
                i === 0
                  ? "bg-[var(--vz-violet)] text-white"
                  : "bg-[var(--vz-card-2)] text-[var(--vz-muted)]",
              )}
            >
              {s}
            </span>
          ))}
        </div>

        <ul className="mt-2 flex flex-col gap-1.5">
          {notes.map((n) => (
            <li key={n.id}>
              <Link
                href="/notes"
                className="flex items-center gap-2.5 rounded-xl border border-[var(--vz-border-soft)] bg-[var(--vz-card-2)] p-2 transition hover:border-[var(--vz-violet)]/40"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--vz-cyan)]/15 text-[var(--vz-cyan)]">
                  <FileText size={13} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-semibold">{n.title}</p>
                  <p className="truncate text-[8px] text-[var(--vz-muted)]">
                    {n.subject} · {n.uploader} · {n.openCount} opens
                  </p>
                </div>
                <Pill tone="neutral">{n.source}</Pill>
              </Link>
            </li>
          ))}
        </ul>
      </DashCard>

      {/* Lost & Found */}
      <DashCard className="p-4">
        <SectionTitle
          icon={<PackageSearch size={14} />}
          title="Lost & Found"
          action={
            <Link
              href="/lost-and-found"
              aria-label="Post a lost or found item"
              className="grid size-6 place-items-center rounded-lg bg-[var(--vz-violet)] text-white transition hover:opacity-90"
            >
              <Plus size={12} />
            </Link>
          }
        />

        <ul className="mt-3 flex flex-col gap-2">
          {lostFound.map((l) => (
            <li key={l.id}>
              <Link
                href="/lost-and-found"
                className="flex items-center gap-2.5 rounded-xl border border-[var(--vz-border-soft)] bg-[var(--vz-card-2)] p-2.5 transition hover:border-[var(--vz-violet)]/40"
              >
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-lg",
                    l.type === "found"
                      ? "bg-[var(--vz-amber)]/15 text-[var(--vz-amber)]"
                      : "bg-[var(--vz-red)]/15 text-[var(--vz-red)]",
                  )}
                >
                  <FolderSearch size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Pill tone={l.type === "found" ? "amber" : "red"}>{l.type}</Pill>
                    <span className="text-[8px] text-[var(--vz-muted-2)]">{l.createdLabel}</span>
                  </div>
                  <p className="mt-0.5 truncate text-[10px] font-semibold">{l.itemName}</p>
                  <p className="truncate text-[8px] text-[var(--vz-muted)]">{l.location ?? "Campus"}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/lost-and-found"
          className="mt-2 flex items-center justify-center gap-1 text-[9px] font-medium text-[var(--vz-violet-2)] hover:underline"
        >
          Browse 19 open items
        </Link>
      </DashCard>
    </div>
  );
}

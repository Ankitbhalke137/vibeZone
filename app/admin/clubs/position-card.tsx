"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface PositionCardProps {
  position: any;
  students: any[];
}

export default function PositionCard({ position, students }: PositionCardProps) {
  const { toast } = useToast();
  const [holderId, setHolderId] = useState(position.holderId ?? "");
  const [busy, setBusy] = useState(false);

  const eligibleYearLabel =
    position.eligibleYear === null
      ? "All years"
      : `20${30 - position.eligibleYear} Batch`;

  const isFilled = position.status === "filled" && position.holder;

  const eligibleStudents =
    position.eligibleYear === null
      ? students
      : students.filter((s) => s.year === position.eligibleYear);

  const assignHolder = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch(`/api/club-positions/${position.id}/holder`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ holderId: holderId || null }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast({
          title: "Failed",
          description: d.error ?? "Could not update holder.",
          tone: "error",
        });
        return;
      }
      toast({
        title: "Updated",
        description: holderId ? "Holder assigned." : "Holder removed.",
        tone: "success",
      });
    } catch {
      toast({
        title: "Failed",
        description: "Could not update holder.",
        tone: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={assignHolder} className="vz-panel p-4 vz-card-hover group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-[13px] font-bold leading-snug">
            {position.title}
          </h3>
          <p className="mt-1 text-[10px] text-muted">{position.club?.name ?? ""}</p>
          <p className="mt-0.5 text-[10px] text-muted">{eligibleYearLabel}</p>
        </div>
        <Badge
          tone={isFilled ? "green" : "violet"}
          className="text-[9px] uppercase shrink-0"
        >
          {isFilled ? "Filled" : "Open"}
        </Badge>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-semibold text-muted w-20 shrink-0">
            Holder
          </label>
          <select
            value={holderId}
            onChange={(e) => setHolderId(e.target.value)}
            disabled={busy}
            className="flex-1 h-9 rounded-xl border border-border bg-card px-2.5 text-sm text-foreground outline-none focus:border-primary/60 disabled:opacity-50"
          >
            <option value="">No holder assigned</option>
            {eligibleStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.handle}) · {s.year ? `20${30 - s.year}` : "N/A"} · {s.branch}
              </option>
            ))}
          </select>
        </div>
        {isFilled && position.holder && (
          <p className="text-[10px] text-muted">
            Current: {position.holder.name} (@{position.holder.handle})
          </p>
        )}
        <Button
          type="submit"
          disabled={busy}
          size="sm"
          className="w-full md:w-auto"
        >
          {busy ? "Updating…" : isFilled ? "Update holder" : "Assign holder"}
        </Button>
      </div>
    </form>
  );
}

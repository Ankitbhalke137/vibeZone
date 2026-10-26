"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ga } from "@/lib/ga";

export function RsvpButton({
  eventId,
  initialStatus,
  capacity,
  going,
  closed,
  signedIn,
}: {
  eventId: string;
  initialStatus: "going" | "maybe" | "not_going" | null;
  capacity: number | null;
  going: number;
  closed: boolean;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [count, setCount] = useState(going);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (closed) {
    return (
      <p className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted">
        RSVP is closed for this event.
      </p>
    );
  }

  if (!signedIn) {
    return (
      <a
        href={`/login?next=/events/${eventId}`}
        className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        Sign in to RSVP
      </a>
    );
  }

  const isGoing = status === "going";
  const full = capacity !== null && count >= capacity && !isGoing;

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant={isGoing ? "secondary" : "primary"}
        disabled={busy || full}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            const res = await fetch(`/api/events/${eventId}/rsvp`, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({}),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Couldn't update RSVP.");
            setStatus(data.status);
            setCount(data.going);
            if (data.status === "going") ga.eventRsvp(eventId);
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Couldn't update RSVP.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {isGoing ? <CalendarX size={16} aria-hidden /> : <CalendarCheck size={16} aria-hidden />}
        {busy ? "Updating…" : isGoing ? "You're going — cancel" : full ? "Event full" : "RSVP"}
      </Button>
      {capacity ? (
        <p className="text-[11px] text-muted">
          {count}/{capacity} going
        </p>
      ) : (
        <p className="text-[11px] text-muted">{count} going</p>
      )}
      {error ? <p className="text-[11px] text-danger">{error}</p> : null}
    </div>
  );
}

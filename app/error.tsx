"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[vibezone] route error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[65dvh] max-w-3xl items-center px-4 py-10">
      <div className="vz-panel relative w-full overflow-hidden p-6 text-center sm:p-10">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-danger/10 text-danger">
          <AlertTriangle size={26} />
        </span>
        <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-danger">
          Something went wrong
        </p>
        <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
          We hit a snag.
        </h1>
        <p className="mx-auto mt-2 max-w-md text-[12px] leading-relaxed text-muted">
          The page couldn&apos;t load. Try again — if it keeps happening, share it through the
          feedback page and the team will take a look.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-[11px] font-bold text-white transition hover:brightness-110"
          >
            <RotateCcw size={14} /> Try again
          </button>
          <Link
            href="/home"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-4 text-[11px] font-semibold text-muted transition hover:text-foreground"
          >
            <Home size={14} /> Back home
          </Link>
        </div>
        {error.digest ? (
          <p className="mt-4 text-[9px] text-muted-2">Reference: {error.digest}</p>
        ) : null}
      </div>
    </div>
  );
}

import Link from "next/link";
import { ArrowLeft, Compass, Home, SearchX } from "lucide-react";
import { Brand } from "@/components/brand";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[65dvh] max-w-3xl items-center px-4 py-10">
      <div className="vz-panel vz-soft-gradient relative w-full overflow-hidden p-6 text-center sm:p-10">
        <div className="vz-landing-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative">
          <Brand href="/" size="md" className="justify-center" />
          <span className="mx-auto mt-6 grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <SearchX size={26} />
          </span>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            404 · Page not found
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
            This corner of campus is empty.
          </h1>
          <p className="mx-auto mt-2 max-w-md text-[12px] leading-relaxed text-muted">
            The page may have moved, been archived, or never existed. Head back to the feed or
            explore what&apos;s happening across campus.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/home"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-[11px] font-bold text-white transition hover:brightness-110"
            >
              <Home size={14} /> Go home
            </Link>
            <Link
              href="/explore"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-4 text-[11px] font-semibold text-muted transition hover:text-foreground"
            >
              <Compass size={14} /> Explore campus
            </Link>
            <Link
              href="/"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-[11px] font-semibold text-muted transition hover:text-foreground"
            >
              <ArrowLeft size={13} /> Landing page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

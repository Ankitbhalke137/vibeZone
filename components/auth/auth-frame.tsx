"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  MessagesSquare,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";

const FEATURES = [
  {
    icon: MessagesSquare,
    title: "Campus conversations",
    description: "Channels, DMs and alias mode for the moments that matter.",
  },
  {
    icon: BookOpen,
    title: "Everything in one place",
    description: "Notes, events, polls, announcements and Lost & Found.",
  },
  {
    icon: GraduationCap,
    title: "People who get it",
    description: "Find seniors, mentors and classmates across your branch.",
  },
];

export function AuthFrame({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
      <div className="vz-landing-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute -left-32 top-20 size-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-10 size-96 rounded-full bg-fuchsia-400/10 blur-3xl" />

      <header className="relative z-10 flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Brand href="/" size="md" subtitle />
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-[11px] font-semibold text-muted transition hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft size={13} /> Back home
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10 grid flex-1 items-stretch gap-4 p-4 pt-1 sm:p-6 sm:pt-2 lg:grid-cols-[1.04fr_0.96fr] lg:p-8 lg:pt-4">
        <aside className="vz-hero relative hidden min-h-[620px] flex-col justify-between overflow-hidden rounded-3xl p-8 text-white lg:flex xl:p-10">
          <div className="vz-hero-glow pointer-events-none absolute inset-0" />
          <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 size-80 rounded-full border border-white/10" />

          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] backdrop-blur">
              <Sparkles size={11} /> Your campus, connected
            </span>
            <h1 className="mt-5 max-w-md text-4xl font-black leading-[1.05] tracking-tight xl:text-[44px]">
              Campus life,
              <br />
              without the noise.
            </h1>
            <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-white/75">
              VibeZone brings your classmates, resources, events and opportunities into one calm,
              student-first space.
            </p>
          </div>

          <div className="relative flex flex-col gap-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/15">
                  <feature.icon size={16} />
                </span>
                <div>
                  <p className="text-[12px] font-bold">{feature.title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-white/65">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative flex items-center gap-2 text-[10px] text-white/55">
            <UserRoundCheck size={12} />
            Built for the PW IOI campus community.
          </div>
        </aside>

        <section className="flex items-center justify-center py-6 lg:py-10">
          <div className="w-full max-w-[440px]">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
              {eyebrow}
            </p>
            <h2 className="mt-1.5 text-2xl font-black tracking-tight sm:text-[30px]">{title}</h2>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{description}</p>
            <div className="mt-5">{children}</div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 flex flex-wrap items-center justify-between gap-2 px-4 pb-4 pt-2 text-[10px] text-muted-2 sm:px-6 lg:px-8">
        <span>VibeZone · Built by students, for students.</span>
        <span>Secure campus email sign-in · No passwords.</span>
      </footer>
    </div>
  );
}

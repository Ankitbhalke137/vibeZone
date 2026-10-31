import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Compass,
  GraduationCap,
  Hash,
  Megaphone,
  MessageSquare,
  PackageSearch,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Vote,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { HeroCanvas } from "@/components/3d/hero-canvas";
import { MeshBackground } from "@/components/3d/mesh-background";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Megaphone,
    title: "Announcements",
    body: "Official academic, hostel, club and placement notices in one verified board — no more buried messages.",
    tone: "violet" as const,
  },
  {
    icon: CalendarDays,
    title: "Campus events",
    body: "Discover what's happening, RSVP in a tap, and get reminders 24 hours and 1 hour before.",
    tone: "magenta" as const,
  },
  {
    icon: BookOpen,
    title: "Notes & resources",
    body: "Search subject-wise notes, PYQs, labs and slides shared by students and verified seniors.",
    tone: "cyan" as const,
  },
  {
    icon: MessageSquare,
    title: "Chat & DMs",
    body: "Join campus channels, start direct conversations, or speak freely with moderated alias mode.",
    tone: "green" as const,
  },
  {
    icon: GraduationCap,
    title: "Seniors Connect",
    body: "Find mentors for DSA, placements, higher studies and campus life — then request a conversation.",
    tone: "amber" as const,
  },
  {
    icon: Vote,
    title: "Polls & leaderboard",
    body: "Vote on the daily campus poll, earn points for meaningful actions, and climb the weekly board.",
    tone: "violet" as const,
  },
  {
    icon: PackageSearch,
    title: "Lost & Found",
    body: "Report lost items, post found ones, and mark them resolved when they make it back home.",
    tone: "magenta" as const,
  },
  {
    icon: ShieldCheck,
    title: "Anonymous feedback",
    body: "A safe, truly anonymous line to the admin team — no handle, email or session stored.",
    tone: "green" as const,
  },
];

const STEPS = [
  {
    title: "Sign in with campus email",
    body: "Enter your @pwioi.com address and verify a six-digit code. No passwords to remember.",
    icon: Hash,
  },
  {
    title: "Set up your student profile",
    body: "Add your name, handle, branch and year. Choose an avatar and tell campus what you're into.",
    icon: Users,
  },
  {
    title: "Jump into campus life",
    body: "Catch up on announcements, join channels, RSVP to events, share notes and find a mentor.",
    icon: Compass,
  },
];

const FAQS = [
  {
    q: "Who can join VibeZone?",
    a: "VibeZone is built for the PW IOI campus community. Sign-in is limited to approved campus email addresses, so every account belongs to a verified student or staff member.",
  },
  {
    q: "Do I need a password?",
    a: "No. VibeZone uses a six-digit one-time code sent to your campus email. Codes expire after 10 minutes and can only be used once.",
  },
  {
    q: "Is my chat private?",
    a: "Direct messages are visible only to the people in the conversation. Campus channels are moderated, and alias mode lets you participate without your name attached — misuse can be reviewed by authorized moderators with an audit trail.",
  },
  {
    q: "Is the anonymous feedback really anonymous?",
    a: "Feedback submissions are not linked to your account, handle or session. Limited anti-abuse metadata is retained briefly and disclosed in the privacy policy. In very small groups, context can still make a person identifiable, so we never promise absolute anonymity.",
  },
  {
    q: "What does it cost?",
    a: "VibeZone is a student-built campus platform. There is no paywall for students — core features are available to every verified campus member.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Brand href="/" />
          <nav className="ml-4 hidden items-center gap-5 text-xs font-medium text-muted md:flex">
            <a href="#features" className="transition hover:text-foreground">Features</a>
            <a href="#how" className="transition hover:text-foreground">How it works</a>
            <a href="#community" className="transition hover:text-foreground">Community</a>
            <a href="#faq" className="transition hover:text-foreground">FAQ</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden rounded-xl px-3 py-2 text-xs font-semibold text-muted transition hover:bg-accent hover:text-foreground sm:block"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-xs font-semibold text-white shadow-[0_8px_20px_-12px_rgba(112,71,245,0.9)] transition hover:brightness-110 sm:px-4"
            >
              Join VibeZone <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative isolate overflow-hidden">
          <div className="vz-landing-grid pointer-events-none absolute inset-0 -z-10" />
          <div className="pointer-events-none absolute -left-32 top-10 -z-10 size-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 top-32 -z-10 size-80 rounded-full bg-fuchsia-400/10 blur-3xl" />

          <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-20">
            <div>
              <Badge tone="violet" className="normal-case tracking-normal">
                <Sparkles size={11} /> Built for the PW IOI campus
              </Badge>
              <h1 className="mt-4 text-[38px] font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-[56px]">
                Everything your campus needs,{" "}
                <span className="vz-gradient-text">in one place.</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
                Connect, learn, engage, and grow with your campus community. Announcements, chat,
                events, notes, polls, mentorship and Lost &amp; Found — organised, moderated and
                mobile-first.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-[0_12px_30px_-16px_rgba(112,71,245,0.9)] transition hover:brightness-110"
                >
                  Join VibeZone <ArrowRight size={15} />
                </Link>
                <a
                  href="#features"
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-semibold transition hover:bg-accent"
                >
                  Explore features
                </a>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-success" /> Campus email only
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-success" /> No passwords
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-success" /> Moderated &amp; private
                </span>
              </div>
            </div>

            {/* Product preview — 3D canvas on desktop, glass cards on mobile */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-none lg:hidden">
              <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-fuchsia-400/20 blur-2xl" />
              <div className="vz-panel-2 overflow-hidden p-0">
                <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-2.5">
                  <span className="size-2 rounded-full bg-danger/60" />
                  <span className="size-2 rounded-full bg-warning/60" />
                  <span className="size-2 rounded-full bg-success/60" />
                  <span className="ml-2 truncate rounded-md bg-accent px-2 py-0.5 text-[8px] text-muted">
                    vibezone.app/home
                  </span>
                </div>
                <div className="space-y-3 p-3.5">
                  <div className="vz-hero relative overflow-hidden rounded-xl p-4 text-white">
                    <p className="text-[9px] font-medium uppercase tracking-wider text-white/70">
                      Good evening, Aarav
                    </p>
                    <p className="mt-1 text-base font-bold leading-snug">
                      Campus is buzzing tonight.
                    </p>
                    <p className="mt-1 max-w-[15rem] text-[9px] leading-relaxed text-white/75">
                      3 new announcements and today&apos;s poll is waiting for your vote.
                    </p>
                    <div className="mt-3 flex gap-1.5">
                      <span className="rounded-md bg-white px-2 py-1 text-[8px] font-bold text-primary">
                        View poll
                      </span>
                      <span className="rounded-md bg-white/15 px-2 py-1 text-[8px] font-semibold backdrop-blur">
                        Open chat
                      </span>
                    </div>
                    <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-white/15 blur-2xl" />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: Megaphone, label: "Announcements", tone: "bg-primary/10 text-primary" },
                      { icon: BookOpen, label: "Notes", tone: "bg-cyan-500/10 text-cyan-600" },
                      { icon: Vote, label: "Daily poll", tone: "bg-fuchsia-500/10 text-fuchsia-600" },
                    ].map((item) => (
                      <div key={item.label} className="vz-panel-2 p-2 text-center">
                        <span className={`mx-auto grid size-6 place-items-center rounded-md ${item.tone}`}>
                          <item.icon size={11} />
                        </span>
                        <p className="mt-1 truncate text-[7px] font-semibold">{item.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="vz-panel-2 p-2.5">
                    <div className="flex items-center gap-2">
                      <span className="grid size-6 place-items-center rounded-full bg-primary/15 text-[8px] font-bold text-primary">
                        S
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[8px] font-semibold">Sana Punjabi</p>
                        <p className="text-[7px] text-muted">2h ago · Campus life</p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[7px] font-semibold text-primary">
                        Following
                      </span>
                    </div>
                    <p className="mt-1.5 text-[8px] leading-relaxed text-muted">
                      Sunset run club meets at the main gate at 5:30. All years welcome — bring
                      water and good vibes.
                    </p>
                    <div className="mt-1.5 flex gap-2 text-[7px] text-muted">
                      <span>♥ 86</span>
                      <span>💬 12</span>
                      <span>↗ Share</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <HeroCanvas />
            </div>
          </div>
        </section>

        {/* Feature strip */}
        <section className="border-y border-border bg-card/60">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-7 gap-y-3 px-4 py-4 text-[11px] font-medium text-muted sm:px-6">
            {[
              [Megaphone, "Announcements"],
              [MessageSquare, "Chat"],
              [CalendarDays, "Events"],
              [BookOpen, "Notes"],
              [Vote, "Polls"],
              [GraduationCap, "Mentorship"],
              [PackageSearch, "Lost & Found"],
              [Trophy, "Leaderboard"],
            ].map(([Icon, label]) => (
              <span key={label as string} className="inline-flex items-center gap-1.5">
                <Icon size={13} className="text-primary" /> {label as string}
              </span>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 py-16 lg:py-24">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <Badge tone="violet" className="normal-case tracking-normal">Everything in one place</Badge>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                A campus tool that actually feels good to use
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Built around the things students do every day — not a generic college portal.
              </p>
            </div>

            <div className="mt-10 vz-stagger-appear grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature, index) => (
                <article
                  key={feature.title}
                  className={cn("vz-glass-card vz-card-hover p-4", index % 2 === 0 && "vz-glow-inner")}
                  style={{ transitionDelay: `${index * 60}ms` }}
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <feature.icon size={18} />
                  </span>
                  <h3 className="mt-3 text-sm font-bold">{feature.title}</h3>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-muted">{feature.body}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-primary">
                    Learn more <ChevronRight size={11} />
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 border-y border-border bg-card/50 py-16 lg:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <Badge tone="violet" className="normal-case tracking-normal">Three steps</Badge>
                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                  From sign-in to campus life in minutes
                </h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                  VibeZone uses your campus identity, so the community stays trusted and the
                  experience stays simple.
                </p>
                <Link
                  href="/login"
                  className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
                >
                  Get started with your campus email <ArrowRight size={13} />
                </Link>
              </div>
              <ol className="flex flex-col gap-3">
                {STEPS.map((step, index) => (
                  <li key={step.title} className="vz-panel flex items-start gap-3 p-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-white shadow-[0_8px_20px_-12px_rgba(112,71,245,0.9)]">
                      <step.icon size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        Step {index + 1}
                      </p>
                      <h3 className="mt-0.5 text-sm font-bold">{step.title}</h3>
                      <p className="mt-1 text-[11px] leading-relaxed text-muted">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Community benefits */}
        <section id="community" className="scroll-mt-20 py-16 lg:py-24">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div className="vz-soft-gradient relative overflow-hidden rounded-2xl border border-border p-6 sm:p-8">
              <div className="vz-map pointer-events-none absolute inset-0 opacity-60" />
              <div className="relative">
                <Badge tone="green" className="normal-case tracking-normal">
                  <ShieldCheck size={11} /> Safe by design
                </Badge>
                <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                  A community that looks out for each other
                </h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                  Verification, moderation, alias controls and anonymous feedback are part of the
                  foundation — not an afterthought.
                </p>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {[
                    ["Verified campus accounts", Users],
                    ["Moderated channels", MessageSquare],
                    ["Alias reveal audit trail", ShieldCheck],
                    ["Anonymous feedback", BellRing],
                  ].map(([label, Icon]) => (
                    <div key={label as string} className="flex items-center gap-2 rounded-xl border border-border bg-card/80 px-3 py-2 text-[11px] font-medium">
                      <Icon size={13} className="text-primary" /> {label as string}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Badge tone="violet" className="normal-case tracking-normal">Made for campus</Badge>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                More signal, less noise
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Stop scrolling five group chats to find one notice. VibeZone gives every part of
                campus a clear home, with the tools to keep it useful.
              </p>
              <ul className="mt-5 flex flex-col gap-3">
                {[
                  {
                    title: "One trusted notice board",
                    body: "Official announcements are pinned, categorised and readable even before you sign in.",
                  },
                  {
                    title: "Resources that stay findable",
                    body: "Notes, PYQs and labs are tagged by subject, branch, year and type.",
                  },
                  {
                    title: "Real campus connections",
                    body: "Channels, DMs and mentorship requests help you meet the people behind the usernames.",
                  },
                  {
                    title: "Earn points for meaningful actions",
                    body: "Vote, share, RSVP and contribute — the leaderboard rewards participation, not spam.",
                  },
                ].map((item) => (
                  <li key={item.title} className="flex gap-2.5">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" />
                    <div>
                      <p className="text-xs font-semibold">{item.title}</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 border-t border-border bg-card/50 py-16 lg:py-20">
          <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
            <div className="text-center">
              <Badge tone="violet" className="normal-case tracking-normal">Questions</Badge>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Good to know
              </h2>
            </div>
            <div className="mt-8 flex flex-col gap-2">
              {FAQS.map((faq) => (
                <details
                  key={faq.q}
                  className="group vz-panel px-4 py-3 open:pb-4"
                >
                  <summary className="flex cursor-pointer list-none items-center gap-3 text-sm font-semibold">
                    <span className="flex-1">{faq.q}</span>
                    <ChevronRight
                      size={15}
                      className="shrink-0 text-muted transition group-open:rotate-90"
                    />
                  </summary>
                  <p className="mt-2 text-[12px] leading-relaxed text-muted">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 py-14 sm:px-6 lg:py-20">
          <div className="vz-hero relative mx-auto max-w-4xl overflow-hidden rounded-3xl px-6 py-10 text-center text-white sm:px-10 sm:py-14">
            <div className="vz-hero-glow pointer-events-none absolute inset-0" />
            <div className="pointer-events-none absolute -left-10 -top-10 size-48 rounded-full bg-white/10 blur-3xl" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                Connect · Learn · Engage · Grow
              </p>
              <h2 className="mx-auto mt-3 max-w-xl text-3xl font-black tracking-tight sm:text-4xl">
                Your campus is already here.
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/80">
                Sign in with your campus email and join the conversation — no passwords, no noise.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-primary transition hover:bg-white/90"
                >
                  Join VibeZone <ArrowRight size={15} />
                </Link>
                <a
                  href="#features"
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-white/15 px-5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25"
                >
                  See what&apos;s inside
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xs">
            <Brand href="/" subtitle />
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              A student-built campus community platform. Everything your campus needs, in one
              place.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-[11px] sm:grid-cols-3">
            <div>
              <p className="mb-2 font-bold text-foreground">Platform</p>
              <ul className="flex flex-col gap-1.5 text-muted">
                <li><a href="#features" className="hover:text-foreground">Features</a></li>
                <li><a href="#how" className="hover:text-foreground">How it works</a></li>
                <li><a href="#faq" className="hover:text-foreground">FAQ</a></li>
              </ul>
            </div>
            <div>
              <p className="mb-2 font-bold text-foreground">Campus</p>
              <ul className="flex flex-col gap-1.5 text-muted">
                <li><Link href="/announcements" className="hover:text-foreground">Announcements</Link></li>
                <li><Link href="/events" className="hover:text-foreground">Events</Link></li>
                <li><Link href="/notes" className="hover:text-foreground">Notes</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-2 font-bold text-foreground">Trust</p>
              <ul className="flex flex-col gap-1.5 text-muted">
                <li><Link href="/feedback" className="hover:text-foreground">Anonymous feedback</Link></li>
                <li><Link href="/settings" className="hover:text-foreground">Privacy</Link></li>
                <li><Link href="/login" className="hover:text-foreground">Sign in</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-border px-4 py-4 text-center text-[10px] text-muted-2 sm:px-6">
          © {new Date().getFullYear()} VibeZone · Built by students, for students.
        </div>
      </footer>
    </div>
  );
}

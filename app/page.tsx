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
  HelpCircle,
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
import { Badge } from "@/components/ui/badge";
import { LandingHeader } from "@/components/landing/landing-header";
import { ProductShowcase } from "@/components/landing/product-showcase";
import { FeaturesSection } from "@/components/landing/features-section";

const STEPS = [
  {
    step: "01",
    title: "Sign in with campus email",
    body: "Enter your @pwioi.com address and verify a six-digit code. No passwords to create or remember.",
    icon: Hash,
  },
  {
    step: "02",
    title: "Set up your student profile",
    body: "Add your name, handle, branch and year. Choose an avatar and select your campus interests.",
    icon: Users,
  },
  {
    step: "03",
    title: "Jump into campus life",
    body: "Catch up on notices, join channels, RSVP to events, share notes, vote on polls, and connect with mentors.",
    icon: Compass,
  },
];

const FAQS = [
  {
    q: "Who can join VibeZone?",
    a: "VibeZone is purpose-built for the PW IOI campus community. Sign-in is restricted to verified campus email addresses (@pwioi.com), ensuring every profile belongs to an actual student, senior, or faculty member.",
  },
  {
    q: "Do I need to remember a password?",
    a: "No passwords required. VibeZone uses a secure, six-digit one-time code sent directly to your campus email. Codes expire after 10 minutes and can only be used once for seamless, passwordless authentication.",
  },
  {
    q: "How does channel moderation and alias mode work?",
    a: "Direct messages are end-to-end private between participants. Campus channels are actively moderated. When you use alias mode to post feedback or ask questions, your handle is masked, but an audit trail protects against abusive behavior.",
  },
  {
    q: "Is the anonymous feedback truly anonymous?",
    a: "Yes. Feedback submissions are never linked to your user account, handle, or session tokens. They go directly to the administration queue for action. We prioritize psychological safety while protecting against spam.",
  },
  {
    q: "Is VibeZone free for students?",
    a: "Yes, completely free. VibeZone is built by students, for students. All core features — announcements, notes, chat, mentorship, and event RSVPs — are freely available to every verified campus member.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-background text-foreground transition-colors duration-200">
      {/* Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      {/* Header with Responsive Hamburger, Drawer, Scrollspy & 14px Typography */}
      <LandingHeader />

      <main id="main-content" tabIndex={-1} className="outline-none">
        {/* Hero Section */}
        <section className="relative isolate overflow-hidden pt-4 pb-12 sm:pt-8 sm:pb-16 lg:pb-24 lg:pt-14">
          <div className="vz-landing-grid pointer-events-none absolute inset-0 -z-10" />
          <div className="pointer-events-none absolute -left-32 top-10 -z-10 size-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 top-32 -z-10 size-80 rounded-full bg-fuchsia-400/10 blur-3xl" />

          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1fr] lg:gap-10">
            {/* Left Hero Column */}
            <div className="flex flex-col justify-center">
              <div className="inline-flex">
                <Badge tone="violet" className="normal-case tracking-normal">
                  <Sparkles size={12} className="mr-1 text-primary" /> Built for the PW IOI campus
                </Badge>
              </div>

              <h1 className="mt-4 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-[54px]">
                Everything your campus needs,{" "}
                <span className="vz-gradient-text">in one place.</span>
              </h1>

              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
                Connect, learn, engage, and grow with your campus community. Announcements, chat,
                events, notes, polls, mentorship, and Lost &amp; Found — organised, moderated, and
                mobile-first.
              </p>

              {/* CTAs */}
              <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8">
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-[0_12px_30px_-14px_rgba(112,71,245,0.9)] transition-all hover:brightness-110 active:scale-95 sm:text-base"
                >
                  Join VibeZone <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground transition hover:bg-accent hover:border-primary/40 active:scale-95 sm:text-base"
                >
                  Explore features
                </a>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500" aria-hidden="true" />
                  Campus email only
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500" aria-hidden="true" />
                  No passwords
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500" aria-hidden="true" />
                  Moderated &amp; private
                </span>
              </div>
            </div>

            {/* Right Hero Column: Realistic VibeZone Product Showcase with 3D Depth */}
            <div className="w-full">
              <ProductShowcase />
            </div>
          </div>
        </section>

        {/* Feature Ribbon & Features Grid (Bug #4 & Bug #5 fixed with interactive ribbon, dynamic tones, modal) */}
        <FeaturesSection />

        {/* How It Works Section */}
        <section id="how" className="scroll-mt-20 border-y border-border bg-card/50 py-16 lg:py-24">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <Badge tone="violet" className="normal-case tracking-normal">
                  Three simple steps
                </Badge>
                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                  From sign-in to campus life in minutes
                </h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-muted sm:text-base">
                  VibeZone validates your verified campus identity, keeping the community trusted,
                  safe, and welcoming for every student.
                </p>
                <Link
                  href="/login"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all hover:gap-3 hover:underline"
                >
                  Get started with your campus email <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>

              <ol className="flex flex-col gap-4">
                {STEPS.map((step) => {
                  const Icon = step.icon;
                  return (
                    <li
                      key={step.title}
                      className="vz-panel vz-card-hover group flex items-start gap-4 p-5 transition-all"
                    >
                      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary text-white shadow-[0_8px_20px_-10px_rgba(112,71,245,0.9)] transition-transform duration-200 group-hover:scale-105">
                        <Icon size={20} aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-primary">
                          Step {step.step}
                        </p>
                        <h3 className="mt-1 text-base font-bold text-foreground">
                          {step.title}
                        </h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-muted sm:text-sm">
                          {step.body}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </section>

        {/* Community & Safety Section (Visually Distinct & Social-First) */}
        <section id="community" className="scroll-mt-20 py-16 lg:py-24">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <Badge tone="violet" className="normal-case tracking-normal">
                Trust &amp; Connection
              </Badge>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                A social platform built on trust and accountability
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                Campus communication should be lively and vibrant, without the spam, toxicity, or
                chaos of unmoderated group chats.
              </p>
            </div>

            <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:items-stretch">
              {/* Distinct Safety Card */}
              <div className="vz-soft-gradient relative flex flex-col justify-between overflow-hidden rounded-2xl border border-emerald-500/20 p-6 sm:p-8">
                <div className="vz-map pointer-events-none absolute inset-0 opacity-60" />
                <div className="relative">
                  <Badge tone="green" className="normal-case tracking-normal">
                    <ShieldCheck size={12} className="mr-1 text-emerald-500" /> Safe by design
                  </Badge>
                  <h3 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl text-foreground">
                    A community that looks out for each other
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                    Verification, moderation, alias controls, and anonymous feedback are foundational
                    architectural choices — not afterthought add-ons.
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {[
                      { label: "Verified campus accounts", desc: "Limited strictly to @pwioi.com", icon: Users },
                      { label: "Moderated channels", desc: "Active oversight and spam filters", icon: MessageSquare },
                      { label: "Alias reveal audit trail", desc: "Safe expression with abuse safeguards", icon: ShieldCheck },
                      { label: "Anonymous feedback", desc: "Zero session or identity storage", icon: BellRing },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className="rounded-xl border border-border/80 bg-card/90 p-3.5 shadow-sm transition hover:border-emerald-500/40"
                        >
                          <div className="flex items-center gap-2">
                            <span className="grid size-7 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              <Icon size={14} aria-hidden="true" />
                            </span>
                            <span className="text-xs font-bold text-foreground">{item.label}</span>
                          </div>
                          <p className="mt-1.5 text-[11px] leading-relaxed text-muted">{item.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Distinct Social Community Card */}
              <div className="vz-soft-gradient relative flex flex-col justify-between overflow-hidden rounded-2xl border border-violet-500/20 p-6 sm:p-8">
                <div className="relative">
                  <Badge tone="violet" className="normal-case tracking-normal">
                    <Sparkles size={12} className="mr-1 text-primary" /> Made for campus
                  </Badge>
                  <h3 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl text-foreground">
                    More signal, less noise
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                    Stop scrolling through dozens of chaotic chat groups just to find one notice.
                    VibeZone gives every corner of campus life an organized home.
                  </p>

                  <ul className="mt-6 flex flex-col gap-3.5">
                    {[
                      {
                        title: "One verified notice board",
                        body: "Official announcements are pinned, categorised, and always easy to reference.",
                      },
                      {
                        title: "Curated academic resources",
                        body: "Study notes, PYQs, and lab solutions indexed by branch, semester, and course.",
                      },
                      {
                        title: "Meaningful senior mentorship",
                        body: "Connect with verified seniors and alumni for DSA, resume reviews, and placement advice.",
                      },
                      {
                        title: "Recognition for active participation",
                        body: "Vote on polls, help peers, and earn karma points that showcase your campus contributions.",
                      },
                    ].map((item) => (
                      <li key={item.title} className="flex gap-3">
                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                          <CheckCircle2 size={14} aria-hidden="true" />
                        </span>
                        <div>
                          <p className="text-xs font-bold text-foreground sm:text-sm">{item.title}</p>
                          <p className="mt-0.5 text-xs leading-relaxed text-muted">{item.body}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section with Semantic details/summary, accessible focus, and polished open styling */}
        <section id="faq" className="scroll-mt-20 border-t border-border bg-card/50 py-16 lg:py-24">
          <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
            <div className="text-center">
              <Badge tone="violet" className="normal-case tracking-normal">
                <HelpCircle size={11} className="mr-1" /> Questions &amp; Answers
              </Badge>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Frequently asked questions
              </h2>
              <p className="mt-3 text-sm text-muted sm:text-base">
                Everything you need to know about joining and using VibeZone.
              </p>
            </div>

            <div className="mt-10 flex flex-col gap-3">
              {FAQS.map((faq) => (
                <details
                  key={faq.q}
                  className="group vz-panel overflow-hidden border border-border transition-all duration-200 open:border-primary/40 open:bg-primary/[0.02] open:shadow-sm"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 text-sm font-bold text-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:text-base">
                    <span className="flex-1">{faq.q}</span>
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-muted transition-transform duration-200 group-open:rotate-90 group-open:bg-primary group-open:text-white">
                      <ChevronRight size={14} aria-hidden="true" />
                    </span>
                  </summary>
                  <div className="border-t border-border/50 px-4 pb-4 pt-2 text-xs leading-relaxed text-muted sm:text-sm">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section (Duplicate tagline bug fixed, action-oriented copy, enhanced contrast) */}
        <section className="px-4 py-16 sm:px-6 lg:py-24">
          <div className="vz-hero relative mx-auto max-w-4xl overflow-hidden rounded-3xl px-6 py-12 text-center text-white sm:px-12 sm:py-16 shadow-2xl">
            <div className="vz-hero-glow pointer-events-none absolute inset-0" />
            <div className="pointer-events-none absolute -left-10 -top-10 size-48 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 -bottom-10 size-48 rounded-full bg-white/10 blur-3xl" />

            <div className="relative">
              <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white/90 backdrop-blur-sm">
                Connect · Learn · Engage · Grow
              </span>

              <h2 className="mx-auto mt-4 max-w-xl text-3xl font-black tracking-tight sm:text-5xl">
                Your campus is already here.
              </h2>

              {/* Bug #2 Fix: Action-oriented copy replacing duplicate tagline */}
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/90 sm:text-base">
                Join hundreds of students already collaborating, finding study groups, attending
                events, and building campus memories. One verified login is all it takes.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-primary shadow-lg transition-all hover:bg-white/95 hover:shadow-xl active:scale-95 sm:text-base"
                >
                  Join VibeZone <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/20 active:scale-95 sm:text-base"
                >
                  See what&apos;s inside
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer with Upgraded 13-14px Typography, Smooth Underlines, and Clear Navigation Grouping */}
      <footer className="border-t border-border bg-card/30">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xs">
            <Brand href="/" subtitle />
            <p className="mt-3 text-xs leading-relaxed text-muted sm:text-sm">
              The modern campus-based social community platform for students. Everything your campus
              needs, in one verified place.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-xs sm:grid-cols-3 sm:text-sm">
            <div>
              <p className="mb-3 font-bold text-foreground">Platform</p>
              <ul className="flex flex-col gap-2 text-muted">
                <li>
                  <a
                    href="#features"
                    className="transition-colors duration-150 hover:text-foreground hover:underline underline-offset-4"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how"
                    className="transition-colors duration-150 hover:text-foreground hover:underline underline-offset-4"
                  >
                    How it works
                  </a>
                </li>
                <li>
                  <a
                    href="#community"
                    className="transition-colors duration-150 hover:text-foreground hover:underline underline-offset-4"
                  >
                    Community &amp; Safety
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="transition-colors duration-150 hover:text-foreground hover:underline underline-offset-4"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="mb-3 font-bold text-foreground">Campus</p>
              <ul className="flex flex-col gap-2 text-muted">
                <li>
                  <Link
                    href="/announcements"
                    className="transition-colors duration-150 hover:text-foreground hover:underline underline-offset-4"
                  >
                    Announcements
                  </Link>
                </li>
                <li>
                  <Link
                    href="/events"
                    className="transition-colors duration-150 hover:text-foreground hover:underline underline-offset-4"
                  >
                    Campus Events
                  </Link>
                </li>
                <li>
                  <Link
                    href="/notes"
                    className="transition-colors duration-150 hover:text-foreground hover:underline underline-offset-4"
                  >
                    Notes &amp; PYQs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/mentorship"
                    className="transition-colors duration-150 hover:text-foreground hover:underline underline-offset-4"
                  >
                    Seniors Connect
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="mb-3 font-bold text-foreground">Trust &amp; Access</p>
              <ul className="flex flex-col gap-2 text-muted">
                <li>
                  <Link
                    href="/feedback"
                    className="transition-colors duration-150 hover:text-foreground hover:underline underline-offset-4"
                  >
                    Anonymous feedback
                  </Link>
                </li>
                <li>
                  <Link
                    href="/settings"
                    className="transition-colors duration-150 hover:text-foreground hover:underline underline-offset-4"
                  >
                    Privacy &amp; Settings
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="transition-colors duration-150 hover:text-foreground hover:underline underline-offset-4"
                  >
                    Student Sign in
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-border px-4 py-6 text-center text-xs text-muted sm:px-6">
          © {new Date().getFullYear()} VibeZone · Built by students, for students · PW IOI
        </div>
      </footer>
    </div>
  );
}

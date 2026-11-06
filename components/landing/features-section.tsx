"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Megaphone,
  CalendarDays,
  BookOpen,
  MessageSquare,
  GraduationCap,
  Vote,
  PackageSearch,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Trophy,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

export interface FeatureItem {
  id: string;
  icon: React.ElementType;
  title: string;
  body: string;
  tone: "violet" | "magenta" | "cyan" | "green" | "amber";
  route: string;
  highlights: string[];
  tagline: string;
}

export const FEATURES: FeatureItem[] = [
  {
    id: "announcements",
    icon: Megaphone,
    title: "Announcements",
    body: "Official academic, hostel, club and placement notices in one verified board — no more buried messages.",
    tone: "violet",
    route: "/announcements",
    tagline: "Never miss a campus notice again",
    highlights: [
      "Verified notices from faculty, clubs, and placement cell",
      "Categorized by Academics, Hostel, Clubs, and Careers",
      "Instant push & email notifications for priority alerts",
    ],
  },
  {
    id: "events",
    icon: CalendarDays,
    title: "Campus events",
    body: "Discover what's happening, RSVP in a tap, and get reminders 24 hours and 1 hour before.",
    tone: "magenta",
    route: "/events",
    tagline: "Your social and academic calendar",
    highlights: [
      "1-tap RSVP for hackathons, cultural fests, and workshops",
      "Automated reminder alerts before start time",
      "See who else from your branch is attending",
    ],
  },
  {
    id: "notes",
    icon: BookOpen,
    title: "Notes & resources",
    body: "Search subject-wise notes, PYQs, labs and slides shared by students and verified seniors.",
    tone: "cyan",
    route: "/notes",
    tagline: "Peer-vetted study material",
    highlights: [
      "Indexed by subject, semester, and engineering branch",
      "Previous year question papers (PYQs) and lab solutions",
      "Upvoted and endorsed by high-scoring seniors",
    ],
  },
  {
    id: "chat",
    icon: MessageSquare,
    title: "Chat & DMs",
    body: "Join campus channels, start direct conversations, or speak freely with moderated alias mode.",
    tone: "green",
    route: "/chat",
    tagline: "Real-time communication, campus-style",
    highlights: [
      "Topic-based campus channels (#general, #dsa, #hackathons)",
      "Direct messaging with fellow classmates",
      "Moderated alias mode with audit trail for safe expression",
    ],
  },
  {
    id: "mentorship",
    icon: GraduationCap,
    title: "Seniors Connect",
    body: "Find mentors for DSA, placements, higher studies and campus life — then request a conversation.",
    tone: "amber",
    route: "/mentorship",
    tagline: "Guidance from seniors who've been there",
    highlights: [
      "Profiles of seniors placed at top tech companies",
      "Request 1-on-1 resume reviews and mock interviews",
      "DSA roadmaps and competitive programming advice",
    ],
  },
  {
    id: "polls",
    icon: Vote,
    title: "Polls & leaderboard",
    body: "Vote on the daily campus poll, earn points for meaningful actions, and climb the weekly board.",
    tone: "violet",
    route: "/polls",
    tagline: "Have a voice and earn recognition",
    highlights: [
      "Daily campus poll open from 7 AM to 11 PM IST",
      "Live percentage charts as votes roll in",
      "Karma points awarded for verified contributions",
    ],
  },
  {
    id: "lost-and-found",
    icon: PackageSearch,
    title: "Lost & Found",
    body: "Report lost items, post found ones, and mark them resolved when they make it back home.",
    tone: "magenta",
    route: "/lost-and-found",
    tagline: "Reuniting campus with lost belongings",
    highlights: [
      "Post photos and campus location tags in seconds",
      "Direct claim verification with security desk integration",
      "Automatic resolution tracking once returned",
    ],
  },
  {
    id: "feedback",
    icon: ShieldCheck,
    title: "Anonymous feedback",
    body: "A safe, truly anonymous line to the admin team — no handle, email or session stored.",
    tone: "green",
    route: "/feedback",
    tagline: "Honest feedback without fear",
    highlights: [
      "Zero account, handle, or cookie logging",
      "Categorized routing to hostel, mess, or academic heads",
      "Transparent campus action updates",
    ],
  },
];

const RIBBON_ITEMS = [
  { label: "Announcements", id: "announcements", icon: Megaphone },
  { label: "Chat", id: "chat", icon: MessageSquare },
  { label: "Events", id: "events", icon: CalendarDays },
  { label: "Notes", id: "notes", icon: BookOpen },
  { label: "Polls", id: "polls", icon: Vote },
  { label: "Mentorship", id: "mentorship", icon: GraduationCap },
  { label: "Lost & Found", id: "lost-and-found", icon: PackageSearch },
  { label: "Leaderboard", id: "polls", icon: Trophy },
];

export function FeaturesSection() {
  const [selectedFeature, setSelectedFeature] = useState<FeatureItem | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const getToneClasses = (tone: FeatureItem["tone"]) => {
    switch (tone) {
      case "violet":
        return "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20";
      case "magenta":
        return "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20";
      case "cyan":
        return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
      case "green":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "amber":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    }
  };

  const handleRibbonClick = (id: string) => {
    setHighlightedId(id);
    const cardEl = document.getElementById(`feature-card-${id}`);
    if (cardEl) {
      const headerOffset = 90;
      const elementPosition = cardEl.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    } else {
      const sectionEl = document.getElementById("features");
      if (sectionEl) {
        sectionEl.scrollIntoView({ behavior: "smooth" });
      }
    }

    // Auto-remove highlight after 2.5 seconds
    setTimeout(() => {
      setHighlightedId(null);
    }, 2500);
  };

  return (
    <>
      {/* Interactive Feature Ribbon */}
      <section
        aria-label="Campus Features Quick Bar"
        className="border-y border-border bg-card/60 backdrop-blur-sm"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-2 px-4 py-3 sm:px-6">
          {RIBBON_ITEMS.map((item) => {
            const Icon = item.icon;
            const isHighlighted = highlightedId === item.id;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleRibbonClick(item.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-95",
                  isHighlighted
                    ? "bg-primary text-white shadow-sm ring-2 ring-primary/40"
                    : "text-muted hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon
                  size={14}
                  className={isHighlighted ? "text-white" : "text-primary"}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Features Grid */}
      <section id="features" className="scroll-mt-20 py-16 lg:py-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge tone="violet" className="normal-case tracking-normal">
              <Sparkles size={11} className="mr-1" /> Everything in one place
            </Badge>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              A campus tool that actually feels good to use
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              Built around the things students do every day — not a clunky college portal.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              const isCardHighlighted = highlightedId === feature.id;

              return (
                <article
                  id={`feature-card-${feature.id}`}
                  key={feature.id}
                  onClick={() => setSelectedFeature(feature)}
                  className={cn(
                    "vz-glass-card vz-card-hover group relative flex cursor-pointer flex-col justify-between rounded-2xl border p-5 transition-all duration-200",
                    isCardHighlighted
                      ? "border-primary ring-4 ring-primary/20 scale-[1.02]"
                      : "border-border hover:border-primary/50",
                    index % 2 === 0 && "vz-glow-inner",
                  )}
                >
                  <div>
                    {/* Dynamic Tone Icon Container (Bug #5 Fix) */}
                    <span
                      className={cn(
                        "grid size-11 place-items-center rounded-xl border transition-transform duration-200 group-hover:scale-105",
                        getToneClasses(feature.tone),
                      )}
                    >
                      <Icon size={20} aria-hidden="true" />
                    </span>

                    <h3 className="mt-4 text-base font-bold tracking-tight text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted sm:text-sm">
                      {feature.body}
                    </p>
                  </div>

                  {/* Interactive Learn More Button (Bug #4 Fix) */}
                  <div className="mt-5 pt-3 border-t border-border/50">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFeature(feature);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-all group-hover:gap-2 hover:underline"
                    >
                      <span>Learn more</span>
                      <span className="sr-only"> about {feature.title}</span>
                      <ChevronRight size={13} aria-hidden="true" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Details Modal (Fixing Dead Spans with Real Context & Routes) */}
      {selectedFeature && (
        <Modal
          open={!!selectedFeature}
          onClose={() => setSelectedFeature(null)}
          title={selectedFeature.title}
          description={selectedFeature.tagline}
          footer={
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedFeature(null)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted transition hover:bg-accent hover:text-foreground"
              >
                Close
              </button>

              <Link
                href={selectedFeature.route}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:brightness-110"
              >
                Open {selectedFeature.title} <ArrowRight size={13} />
              </Link>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "grid size-12 place-items-center rounded-xl border",
                  getToneClasses(selectedFeature.tone),
                )}
              >
                <selectedFeature.icon size={22} />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">
                  {selectedFeature.title}
                </p>
                <p className="text-xs text-muted">Core VibeZone Feature</p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-foreground/90">
              {selectedFeature.body}
            </p>

            <div className="rounded-xl border border-border bg-accent/30 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">
                Key Capabilities
              </p>
              <ul className="mt-2.5 space-y-2">
                {selectedFeature.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs sm:text-sm">
                    <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-primary/20 text-primary">
                      <Check size={11} />
                    </span>
                    <span className="text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}


"use client";

import { useState, useRef } from "react";
import {
  Heart,
  MessageSquare,
  Share2,
  Megaphone,
  Vote,
  Users,
  Calendar,
  Sparkles,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Interactive like button state
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(86);

  // Interactive poll state
  const [selectedPoll, setSelectedPoll] = useState<number | null>(null);
  const [pollVotes, setPollVotes] = useState({ opt1: 184, opt2: 104 });

  const totalVotes = pollVotes.opt1 + pollVotes.opt2;
  const pct1 = Math.round((pollVotes.opt1 / totalVotes) * 100);
  const pct2 = 100 - pct1;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Subtle tilt: max ~6 degrees
    const rotateY = (x / (rect.width / 2)) * 5;
    const rotateX = -(y / (rect.height / 2)) * 5;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const handleToggleLike = () => {
    if (liked) {
      setLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      setLiked(true);
      setLikeCount((c) => c + 1);
    }
  };

  const handleVote = (optionIndex: number) => {
    if (selectedPoll !== null) return;
    setSelectedPoll(optionIndex);
    if (optionIndex === 0) {
      setPollVotes((v) => ({ ...v, opt1: v.opt1 + 1 }));
    } else {
      setPollVotes((v) => ({ ...v, opt2: v.opt2 + 1 }));
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="vz-stage-3d relative mx-auto w-full max-w-xl transition-transform duration-200"
      style={{
        perspective: "1200px",
      }}
    >
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-primary/25 via-fuchsia-500/15 to-violet-500/20 blur-3xl transition-opacity duration-300"
        style={{
          opacity: isHovered ? 0.9 : 0.6,
        }}
      />

      {/* Main Glass Product Window with 3D Tilt */}
      <div
        className={cn(
          "vz-glass-card relative overflow-hidden rounded-2xl border border-border/80 shadow-2xl transition-all duration-300 ease-out",
          "bg-card/90 dark:bg-card/85",
        )}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* App Titlebar */}
        <div className="flex items-center justify-between border-b border-border/80 bg-accent/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-red-400" />
            <span className="size-2.5 rounded-full bg-amber-400" />
            <span className="size-2.5 rounded-full bg-emerald-400" />
            <span className="ml-2 hidden rounded-md bg-card px-2.5 py-1 text-xs font-medium text-muted sm:inline-block">
              vibezone.app/home
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              142 active online
            </span>
          </div>
        </div>

        {/* Product UI Body */}
        <div className="space-y-3.5 p-4 sm:p-5">
          {/* Announcement Ticker */}
          <div className="flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/10 px-3.5 py-2.5 text-xs text-primary transition hover:bg-primary/15">
            <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-primary text-white">
              <Megaphone size={13} />
            </span>
            <div className="min-w-0 flex-1 truncate">
              <span className="font-bold">Official:</span> Mid-term schedule &amp;
              hall tickets released.
            </div>
            <span className="shrink-0 rounded-md bg-primary/20 px-2 py-0.5 text-[11px] font-semibold">
              Pinned
            </span>
          </div>

          {/* Social Feed Card */}
          <div className="vz-panel-2 rounded-xl p-3.5 sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-full bg-gradient-to-tr from-primary to-fuchsia-500 text-xs font-bold text-white shadow-sm">
                  SP
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold sm:text-sm">Sana Punjabi</p>
                    <CheckCircle2 size={13} className="text-primary" />
                  </div>
                  <p className="text-[11px] text-muted">
                    CS &apos;26 · 15m ago · <span className="text-primary">#CampusLife</span>
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                PW IOI
              </span>
            </div>

            <p className="mt-2.5 text-xs leading-relaxed sm:text-sm">
              Sunset run club meets at the main gate at 5:30 today! All years
              welcome — bring water and good vibes. 🌅🏃‍♀️
            </p>

            {/* Social Actions (Interactive Like) */}
            <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-2.5 text-xs text-muted">
              <button
                type="button"
                onClick={handleToggleLike}
                aria-label={liked ? "Unlike post" : "Like post"}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition active:scale-95",
                  liked
                    ? "text-red-500 bg-red-500/10"
                    : "hover:bg-accent hover:text-foreground",
                )}
              >
                <Heart
                  size={15}
                  className={cn("transition-transform", liked && "fill-current scale-110")}
                />
                <span>{likeCount}</span>
              </button>

              <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition hover:bg-accent hover:text-foreground">
                <MessageSquare size={15} />
                <span>12 replies</span>
              </div>

              <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition hover:bg-accent hover:text-foreground">
                <Share2 size={15} />
                <span className="hidden sm:inline">Share</span>
              </div>
            </div>
          </div>

          {/* Interactive Campus Poll Widget */}
          <div className="vz-panel-2 rounded-xl p-3.5 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-md bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400">
                  <Vote size={13} />
                </span>
                <span className="text-xs font-bold sm:text-sm">
                  Daily Campus Poll
                </span>
              </div>
              <span className="text-[11px] text-muted">
                {selectedPoll !== null ? "Voted!" : "Click to vote"}
              </span>
            </div>

            <p className="mt-2 text-xs font-medium text-foreground/90">
              Best spot for late-night exam prep?
            </p>

            <div className="mt-2.5 space-y-2">
              {/* Option 1 */}
              <button
                type="button"
                onClick={() => handleVote(0)}
                aria-pressed={selectedPoll === 0}
                className={cn(
                  "relative w-full overflow-hidden rounded-lg border p-2 text-left text-xs transition active:scale-[0.99]",
                  selectedPoll === 0
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/40 hover:bg-accent/50",
                )}
              >
                <div
                  className="absolute inset-y-0 left-0 bg-primary/15 transition-all duration-500"
                  style={{ width: `${pct1}%` }}
                />
                <div className="relative flex items-center justify-between font-medium">
                  <span>Library 3rd Floor Quiet Zone</span>
                  <span className="font-bold">{pct1}%</span>
                </div>
              </button>

              {/* Option 2 */}
              <button
                type="button"
                onClick={() => handleVote(1)}
                aria-pressed={selectedPoll === 1}
                className={cn(
                  "relative w-full overflow-hidden rounded-lg border p-2 text-left text-xs transition active:scale-[0.99]",
                  selectedPoll === 1
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/40 hover:bg-accent/50",
                )}
              >
                <div
                  className="absolute inset-y-0 left-0 bg-fuchsia-500/15 transition-all duration-500"
                  style={{ width: `${pct2}%` }}
                />
                <div className="relative flex items-center justify-between font-medium">
                  <span>Student Hub Lounge &amp; Cafe</span>
                  <span className="font-bold">{pct2}%</span>
                </div>
              </button>
            </div>
          </div>

          {/* Chat & Senior Mentorship Snippets */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {/* Live Chat Snippet */}
            <div className="rounded-xl border border-border/80 bg-accent/30 p-2.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <Users size={12} className="text-primary" />
                <span>#general-chat</span>
              </div>
              <p className="mt-1.5 truncate text-[11px] text-muted">
                <strong className="text-foreground/90">Aarav:</strong> Anyone got
                notes for Graph Algorithms?
              </p>
              <p className="truncate text-[11px] text-primary font-medium">
                <strong>Priya:</strong> Just uploaded to Notes! 📚
              </p>
            </div>

            {/* Senior Connect Pill */}
            <div className="rounded-xl border border-border/80 bg-accent/30 p-2.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <GraduationCap size={13} className="text-amber-500" />
                <span>Senior Mentor</span>
              </div>
              <p className="mt-1 text-[11px] text-muted">
                Rahul S. · <span className="font-semibold text-foreground">SDE @ Amazon</span>
              </p>
              <span className="mt-1 inline-block rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                DSA &amp; Placement mock
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Accent Badge: Event Notice (With subtle 3D translation) */}
      <div
        className="pointer-events-none absolute -bottom-4 -left-4 hidden rounded-xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur-md sm:flex sm:items-center sm:gap-2.5"
        style={{
          transform: "translateZ(30px)",
        }}
      >
        <div className="grid size-8 place-items-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <Calendar size={16} />
        </div>
        <div>
          <p className="text-xs font-bold">HackIOI 2026</p>
          <p className="text-[11px] text-muted">Tomorrow at 10 AM · 84 RSVPs</p>
        </div>
      </div>

      {/* Floating Accent Badge: Daily Poll Status */}
      <div
        className="pointer-events-none absolute -right-4 -top-3 hidden rounded-xl border border-border bg-card/95 p-2.5 shadow-xl backdrop-blur-md sm:flex sm:items-center sm:gap-2"
        style={{
          transform: "translateZ(35px)",
        }}
      >
        <Sparkles size={14} className="text-primary animate-pulse" />
        <span className="text-xs font-bold">Verified Student Community</span>
      </div>
    </div>
  );
}


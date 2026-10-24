import Link from "next/link";
import { Sparkles, Megaphone, MessagesSquare, CalendarDays, BookOpen, Trophy } from "lucide-react";

const features = [
  { icon: Megaphone, title: "Announcement Board", desc: "Official updates, pinned and readable by anyone — no login needed." },
  { icon: MessagesSquare, title: "Chat & Aliases", desc: "Realtime channels and DMs with moderated alias mode." },
  { icon: CalendarDays, title: "Events & RSVPs", desc: "Campus events with reminders before they start." },
  { icon: BookOpen, title: "Notes Repository", desc: "Subject-wise resources, searchable and upvoteable." },
  { icon: Trophy, title: "Polls & Leaderboard", desc: "Daily polls, points, weekly rankings." },
  { icon: Sparkles, title: "Anonymous Feedback", desc: "A safe line to the admin team — truly anonymous." },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-10 py-8">
      <section className="text-center">
        <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-accent px-3 py-1 text-xs font-medium text-primary">
          <span className="size-1.5 animate-pulse rounded-full bg-success" /> Live on campus
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Everything your campus needs,
          <span className="block text-primary">in one place.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-balance text-sm text-muted sm:text-base">
          Announcements, chat, events, notes, polls and mentorship — moderated, gamified and
          mobile-friendly. Built by a student, for ~200 students.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            Get started — sign in
          </Link>
          <a
            href="#features"
            className="rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium transition hover:bg-accent"
          >
            What&apos;s inside
          </a>
        </div>
        <p className="mt-3 text-xs text-muted">Campus email only · no passwords · OTP in seconds</p>
      </section>

      <section id="features" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-accent text-primary">
                <f.icon size={16} aria-hidden />
              </span>
              <h2 className="text-sm font-semibold">{f.title}</h2>
            </div>
            <p className="text-xs leading-relaxed text-muted">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

import { cn } from "@/lib/utils";

export type BadgeTone = "violet" | "magenta" | "green" | "amber" | "red" | "cyan" | "neutral";

const TONES: Record<BadgeTone, string> = {
  violet: "bg-primary/10 text-primary border-primary/15",
  magenta: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/15",
  green: "bg-success/10 text-success border-success/15",
  amber: "bg-warning/10 text-amber-600 dark:text-amber-400 border-warning/15",
  red: "bg-danger/10 text-danger border-danger/15",
  cyan: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/15",
  neutral: "bg-accent text-muted border-border",
};

export function Badge({
  children,
  tone = "violet",
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

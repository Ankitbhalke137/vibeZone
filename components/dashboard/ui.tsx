import { cn } from "@/lib/utils";
import { presetStyle } from "@/lib/avatars";

export function DashCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn("vz-panel", className)} {...props}>
      {children}
    </section>
  );
}

export function SectionTitle({
  icon,
  title,
  subtitle,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {icon ? (
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[var(--vz-card-3)] text-[var(--vz-violet-2)]">
          {icon}
        </span>
      ) : null}
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-[13px] font-semibold tracking-tight">{title}</h2>
        {subtitle ? <p className="mt-0.5 truncate text-[11px] text-[var(--vz-muted)]">{subtitle}</p> : null}
      </div>
      {action ? <div className="ml-auto shrink-0">{action}</div> : null}
    </div>
  );
}

const TONES = {
  violet: "bg-[var(--vz-violet)]/15 text-[var(--vz-violet-2)]",
  magenta: "bg-[var(--vz-magenta)]/15 text-[var(--vz-magenta)]",
  green: "bg-[var(--vz-green)]/15 text-[var(--vz-green)]",
  amber: "bg-[var(--vz-amber)]/15 text-[var(--vz-amber)]",
  red: "bg-[var(--vz-red)]/15 text-[var(--vz-red)]",
  cyan: "bg-[var(--vz-cyan)]/15 text-[var(--vz-cyan)]",
  neutral: "bg-[var(--vz-card-3)] text-[var(--vz-muted)]",
} as const;

export function Pill({
  children,
  tone = "violet",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DashAvatar({
  name,
  avatarUrl,
  size = "md",
  className,
}: {
  name: string;
  avatarUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  const px = {
    xs: "size-6 text-[9px]",
    sm: "size-8 text-[11px]",
    md: "size-10 text-sm",
    lg: "size-14 text-lg",
  }[size];
  const initial = (name || "?").trim().charAt(0).toUpperCase();

  if (avatarUrl?.startsWith("https://")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={avatarUrl} alt={name} className={cn("shrink-0 rounded-full object-cover", px, className)} />
    );
  }

  const { from, to } = avatarUrl?.startsWith("preset:") ? presetStyle(avatarUrl.slice(7)) : presetStyle("grape");
  return (
    <span
      aria-hidden
      className={cn("grid shrink-0 place-items-center rounded-full font-bold text-white", px, className)}
      style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {initial}
    </span>
  );
}

export function LiveBadge({ label = "LIVE" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-[var(--vz-red)] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white shadow-sm">
      <span className="size-1 rounded-full bg-white" />
      {label}
    </span>
  );
}

export function AvatarStack({
  names,
  extra,
}: {
  names: { name: string; avatarUrl: string | null }[];
  extra?: number;
}) {
  return (
    <div className="flex items-center">
      {names.slice(0, 3).map((n, i) => (
        <DashAvatar
          key={`${n.name}-${i}`}
          name={n.name}
          avatarUrl={n.avatarUrl}
          size="xs"
          className={cn("ring-2 ring-[var(--vz-card)]", i > 0 && "-ml-2")}
        />
      ))}
      {extra ? (
        <span className="-ml-2 grid size-6 place-items-center rounded-full bg-[var(--vz-card-3)] text-[8px] font-semibold text-[var(--vz-muted)] ring-2 ring-[var(--vz-card)]">
          +{extra}
        </span>
      ) : null}
    </div>
  );
}

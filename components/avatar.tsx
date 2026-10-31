import { cn } from "@/lib/utils";

export function Avatar({
  name,
  handle,
  avatarUrl,
  size = "md",
  status,
  className,
}: {
  name: string;
  handle?: string;
  avatarUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | null;
  className?: string;
}) {
  const px = {
    xs: "size-6 text-[9px]",
    sm: "size-8 text-[11px]",
    md: "size-10 text-sm",
    lg: "size-16 text-xl",
    xl: "size-24 text-3xl",
  }[size];
  const initial = (name || handle || "?").trim().charAt(0).toUpperCase();

  const dot =
    status === "online" ? "bg-success" : status === "offline" ? "bg-muted-2" : null;

  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      {avatarUrl?.startsWith("https://") ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={name}
          className={cn("shrink-0 rounded-full object-cover", px)}
        />
      ) : avatarUrl?.startsWith("preset:") ? (
        <AvatarGradient initial={initial} preset={avatarUrl.slice(7)} className={px} />
      ) : (
        <span
          aria-hidden
          className={cn(
            "grid shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary",
            px,
          )}
        >
          {initial}
        </span>
      )}
      {dot ? (
        <span
          aria-hidden
          className={cn(
            "absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-[var(--vz-card)]",
            dot,
          )}
        />
      ) : null}
    </span>
  );
}

function AvatarGradient({
  initial,
  preset,
  className,
}: {
  initial: string;
  preset: string;
  className: string;
}) {
  const GRADIENTS: Record<string, string> = {
    aurora: "linear-gradient(135deg, #22d3ee, #6366f1)",
    sunset: "linear-gradient(135deg, #f97316, #ec4899)",
    forest: "linear-gradient(135deg, #22c55e, #0d9488)",
    grape: "linear-gradient(135deg, #a855f7, #ec4899)",
    ocean: "linear-gradient(135deg, #0ea5e9, #4f46e5)",
    gold: "linear-gradient(135deg, #eab308, #f97316)",
    mint: "linear-gradient(135deg, #34d399, #3b82f6)",
    rose: "linear-gradient(135deg, #fb7185, #f43f5e)",
  };
  return (
    <span
      aria-hidden
      className={cn("grid shrink-0 place-items-center rounded-full font-bold text-white", className)}
      style={{ backgroundImage: GRADIENTS[preset] ?? GRADIENTS.grape }}
    >
      {initial}
    </span>
  );
}

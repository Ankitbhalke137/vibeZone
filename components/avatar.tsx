import { cn } from "@/lib/utils";
import { presetStyle } from "@/lib/avatars";

/**
 * Renders `avatarUrl` in its three accepted shapes:
 *  · `preset:<key>` → gradient chip (the $0 Phase 2 path)
 *  · `https://…`    → real image (Object Storage, Week 3+)
 *  · null           → initials on a neutral chip
 */
export function Avatar({
  name,
  handle,
  avatarUrl,
  size = "md",
  className,
}: {
  name: string;
  handle?: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const px = { sm: "size-8 text-xs", md: "size-11 text-sm", lg: "size-16 text-xl", xl: "size-24 text-3xl" }[size];
  const initial = (name || handle || "?").trim().charAt(0).toUpperCase();

  if (avatarUrl?.startsWith("https://")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        className={cn("shrink-0 rounded-full object-cover", px, className)}
      />
    );
  }

  if (avatarUrl?.startsWith("preset:")) {
    const { from, to } = presetStyle(avatarUrl.slice(7));
    return (
      <span
        aria-hidden
        className={cn(
          "grid shrink-0 place-items-center rounded-full font-bold text-white",
          px,
          className,
        )}
        style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
      >
        {initial}
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-accent font-bold text-primary",
        px,
        className,
      )}
    >
      {initial}
    </span>
  );
}

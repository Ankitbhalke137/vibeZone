import Link from "next/link";
import { cn } from "@/lib/utils";

export function Brand({
  href = "/",
  size = "md",
  subtitle = false,
  className,
}: {
  href?: string;
  size?: "sm" | "md" | "lg";
  subtitle?: boolean;
  className?: string;
}) {
  const mark = {
    sm: "size-8",
    md: "size-10",
    lg: "size-14",
  }[size];
  const title = {
    sm: "text-sm",
    md: "text-sm",
    lg: "text-lg",
  }[size];

  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "shrink-0",
          mark,
        )}
      >
        <svg
          viewBox="0 0 512 512"
          width={size === "sm" ? 32 : size === "md" ? 40 : 56}
          height={size === "sm" ? 32 : size === "md" ? 40 : 56}
          fill="none"
        >
          <path
            d="M60 320L140 140L220 320"
            stroke="url(#vz-gradient)"
            strokeWidth="48"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M80 320C100 200 300 200 320 320"
            fill="none"
            stroke="url(#vz-ring)"
            strokeWidth="10"
          />
          <path d="M320 130L310 140L300 130L310 120ZM320 160L310 150L300 160L310 170ZM300 140L310 140L320 140L310 130ZM310 160L320 160L330 160L320 170Z" fill="#ffffff" />
          <circle cx="180" cy="230" r="100" fill="#7c5cff" opacity="0.3" />
        </svg>
      </span>
      <span className="leading-tight">
        <span className={cn("block font-extrabold tracking-tight", title)}>
          VibeZone
        </span>
        {subtitle ? (
          <span className="block text-[10px] text-muted">
            Connect · Learn · Engage · Grow
          </span>
        ) : null}
      </span>
    </Link>
  );
}

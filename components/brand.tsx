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
    sm: "size-8 rounded-lg text-xs",
    md: "size-9 rounded-xl text-sm",
    lg: "size-11 rounded-2xl text-base",
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
          "vz-brand-gradient grid shrink-0 place-items-center font-black text-white shadow-lg shadow-primary/25",
          mark,
        )}
      >
        V
      </span>
      <span className="leading-tight">
        <span className={cn("block font-extrabold tracking-tight", title)}>VibeZone</span>
        {subtitle ? <span className="block text-[10px] text-muted">Campus, but cooler.</span> : null}
      </span>
    </Link>
  );
}

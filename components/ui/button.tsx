import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline" | "soft";
  size?: "sm" | "md" | "lg" | "icon";
};

const SIZES: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-8 gap-1.5 px-3 text-xs",
  md: "h-10 gap-2 px-4 text-sm",
  lg: "h-12 gap-2 px-6 text-sm",
  icon: "size-10",
};

const VARIANTS: Record<NonNullable<Props["variant"]>, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-[0_8px_20px_-10px_rgba(112,71,245,0.8)] hover:brightness-110 active:brightness-95",
  secondary: "border border-border bg-card text-foreground hover:bg-accent",
  outline: "border border-primary/40 bg-transparent text-primary hover:bg-primary/10",
  soft: "bg-primary/10 text-primary hover:bg-primary/15",
  ghost: "text-muted hover:bg-accent hover:text-foreground",
  danger: "bg-danger text-white hover:brightness-110",
};

export function Button({ className, variant = "primary", size = "md", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-xl font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        SIZES[size],
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}

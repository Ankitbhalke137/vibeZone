import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchBar({
  name = "q",
  defaultValue,
  placeholder = "Search VibeZone…",
  action,
  className,
  inputClassName,
  autoFocus,
}: {
  name?: string;
  defaultValue?: string;
  placeholder?: string;
  action?: string;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
}) {
  return (
    <form action={action} className={cn("relative", className)} role="search">
      <Search
        size={15}
        aria-hidden
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-2"
      />
      <input
        name={name}
        type="search"
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          "h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-2 focus:border-primary/60 focus:ring-4 focus:ring-primary/10",
          inputClassName,
        )}
      />
    </form>
  );
}

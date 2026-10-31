"use client";

import { cn } from "@/lib/utils";

export type TabItem = {
  value: string;
  label: React.ReactNode;
  count?: number;
};

export function Tabs({
  items,
  value,
  onChange,
  className,
  size = "md",
}: {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "vz-no-scrollbar flex items-center gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-lg font-semibold transition",
              size === "sm" ? "px-2.5 py-1.5 text-[11px]" : "px-3 py-2 text-xs",
              active
                ? "bg-primary text-white shadow-[0_6px_16px_-10px_rgba(112,71,245,0.9)]"
                : "text-muted hover:bg-accent hover:text-foreground",
            )}
          >
            {item.label}
            {typeof item.count === "number" ? (
              <span
                className={cn(
                  "rounded-full px-1.5 text-[9px]",
                  active ? "bg-white/20 text-white" : "bg-accent text-muted",
                )}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MOBILE_NAV, isItemActive } from "./nav";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1">
        {MOBILE_NAV.map((item) => {
          const active = isItemActive(pathname, item);
          const isCreate = item.href === "/create";
          if (isCreate) {
            return (
              <li key={item.href} className="flex flex-1 items-center justify-center">
                <Link
                  href={item.href}
                  aria-label="Create"
                  className="-mt-4 grid size-12 place-items-center rounded-full bg-primary text-white shadow-[0_10px_24px_-10px_rgba(112,71,245,0.9)] ring-4 ring-[var(--vz-bg)] transition hover:scale-105"
                >
                  <item.icon size={21} />
                </Link>
              </li>
            );
          }
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-1 py-2.5 text-[10px] font-medium transition",
                  active ? "text-primary" : "text-muted hover:text-foreground",
                )}
              >
                <item.icon size={19} aria-hidden />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

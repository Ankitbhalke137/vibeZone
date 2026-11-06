"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  ArrowRight,
  Sparkles,
  Compass,
  ShieldCheck,
  HelpCircle,
  LogIn,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "#features", label: "Features", icon: Sparkles },
  { href: "#how", label: "How it works", icon: Compass },
  { href: "#community", label: "Community", icon: ShieldCheck },
  { href: "#faq", label: "FAQ", icon: HelpCircle },
];

export function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  // Scrollspy observer for active section detection
  useEffect(() => {
    const sectionIds = ["features", "how", "community", "faq"];
    const observerCallback: IntersectionObserverCallback = (entries) => {
      // Find the entry with the highest intersection ratio or topmost visible
      const visible = entries.filter((e) => e.isIntersecting);
      if (visible.length > 0) {
        // Sort by distance to top of viewport
        visible.sort(
          (a, b) =>
            Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top),
        );
        setActiveSection(visible[0].target.id);
      } else if (window.scrollY < 200) {
        setActiveSection("");
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: "-80px 0px -40% 0px",
      threshold: [0, 0.2, 0.5],
    });

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const handleScroll = () => {
      if (window.scrollY < 120) {
        setActiveSection("");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Lock body scroll when mobile drawer is open & handle Escape
  useEffect(() => {
    if (!mobileOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (href.startsWith("#")) {
        e.preventDefault();
        const targetId = href.slice(1);
        const element = document.getElementById(targetId);
        if (element) {
          const headerOffset = 72;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });

          setActiveSection(targetId);
        }
        setMobileOpen(false);
      }
    },
    [],
  );

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl transition-colors duration-200">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Brand href="/" />
            {/* Desktop Navigation - Typography upgraded to 14px (text-sm) */}
            <nav
              aria-label="Primary"
              className="hidden items-center gap-1 text-sm font-medium text-muted md:flex"
            >
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.href.slice(1);
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={cn(
                      "relative rounded-lg px-3 py-1.5 transition-colors duration-150",
                      isActive
                        ? "text-primary font-semibold"
                        : "text-muted hover:text-foreground hover:bg-accent/60",
                    )}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute inset-x-3 -bottom-2 h-0.5 rounded-full bg-primary" />
                    )}
                  </a>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Desktop Actions */}
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/login"
                className="rounded-xl px-3.5 py-2 text-sm font-semibold text-muted transition hover:bg-accent hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-[0_8px_20px_-12px_rgba(112,71,245,0.9)] transition hover:brightness-110 active:scale-95"
              >
                Join VibeZone <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>

            {/* Hamburger Button for Mobile */}
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-drawer"
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              className="grid size-9 place-items-center rounded-xl border border-border bg-card text-muted transition hover:text-foreground md:hidden"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="fixed inset-0 z-50 md:hidden"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <aside
            className="vz-slide-in-right fixed inset-y-0 right-0 z-50 flex w-full max-w-xs flex-col justify-between border-l border-border bg-card p-6 shadow-2xl"
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-6 border-b border-border">
                <Brand href="/" size="sm" />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-accent hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Links */}
              <nav aria-label="Mobile Drawer" className="mt-6 flex flex-col gap-1.5">
                <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted">
                  Menu
                </p>
                {NAV_ITEMS.map((item) => {
                  const isActive = activeSection === item.href.slice(1);
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-foreground/80 hover:bg-accent hover:text-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-8 place-items-center rounded-lg",
                          isActive
                            ? "bg-primary text-white"
                            : "bg-accent text-muted",
                        )}
                      >
                        <Icon size={15} />
                      </span>
                      <span>{item.label}</span>
                    </a>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Footer Actions */}
            <div className="border-t border-border pt-6 space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-border bg-accent/40 p-3">
                <span className="text-xs font-medium text-muted">Appearance</span>
                <ThemeToggle />
              </div>

              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-semibold transition hover:bg-accent"
              >
                <LogIn size={15} /> Sign in
              </Link>

              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-[0_8px_20px_-10px_rgba(112,71,245,0.9)] transition hover:brightness-110"
              >
                Join VibeZone <ArrowRight size={15} />
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

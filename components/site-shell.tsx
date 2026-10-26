import { ShellNav } from "@/components/shell-nav";

/** Existing mobile-first chrome, preserved for every non-dashboard route. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col">
      <ShellNav />
      <main className="flex-1 px-4 pb-24 pt-4">{children}</main>
      <footer className="border-t border-border px-4 py-4 text-center text-xs text-muted">
        VibeZone · built for the campus · $0 infrastructure
      </footer>
    </div>
  );
}

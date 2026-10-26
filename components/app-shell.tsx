"use client";

import { usePathname } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SiteShell } from "@/components/site-shell";

/**
 * Chooses the chrome for a route:
 *  · `/` renders the full VibeZone dashboard (sidebar + topbar + right rail)
 *  · every other route keeps the mobile-first site shell
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname === "/";
  if (isDashboard) return <DashboardShell>{children}</DashboardShell>;
  return <SiteShell>{children}</SiteShell>;
}

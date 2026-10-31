"use client";

import { usePathname } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";

/**
 * Route chrome:
 *  · `/`                    → public marketing landing (no app chrome)
 *  · `/login`, `/onboarding` → focused authentication screens
 *  · everything else         → the unified campus shell
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = pathname === "/" || pathname === "/login" || pathname === "/onboarding";

  if (bare) return <>{children}</>;
  return <AppLayout>{children}</AppLayout>;
}

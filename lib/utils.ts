import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** `Firstname.Lastname@pwioi.com` → `Firstname Lastname` (best effort). */
export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "student";
  const parts = local.split(/[._+\-]+/).filter(Boolean);
  return parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ")
    .slice(0, 100) || "Student";
}

/** Auto handle at signup: u + 7 base36 chars; replaced during onboarding. */
export function autoHandle(): string {
  return "u" + Math.random().toString(36).slice(2, 9);
}

export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}

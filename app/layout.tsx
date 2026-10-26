import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";
import { AppShell } from "@/components/app-shell";
import { gaInitSnippet } from "@/lib/ga";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// GA4 base (Week 2) — renders nothing when unset (local/preview)
const GA_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

export const metadata: Metadata = {
  title: {
    default: "VibeZone — Everything your campus needs",
    template: "%s · VibeZone",
  },
  description:
    "Announcements, chat, events, notes, polls and more for the PW IOI campus. One moderated, gamified, mobile-friendly web app.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#07070c" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-background text-foreground antialiased`}>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
        {GA_ID ? (
          <>
            <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
            <Script id="ga4-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: gaInitSnippet(GA_ID) }} />
          </>
        ) : null}
      </body>
    </html>
  );
}

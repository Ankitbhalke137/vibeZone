import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";
import { AppShell } from "@/components/app-shell";
import { ToastProvider } from "@/components/ui/toast";
import { PageTransition } from "@/components/ui/page-transition";
import { MeshBackground } from "@/components/3d/mesh-background";
import { InstallPrompt } from "@/components/ui/install-prompt";
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
    "Your campus in one place: announcements, chat, events, notes, polls, Lost & Found, mentorship and more for the PW IOI campus.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6ff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0b18" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-background text-foreground antialiased`}>
        <ThemeProvider>
          <ToastProvider>
            <MeshBackground />
            <PageTransition>
              <AppShell>{children}</AppShell>
            </PageTransition>
            <InstallPrompt />
          </ToastProvider>
        </ThemeProvider>
        <Script
          id="sw-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').then((reg) => {
                    console.log('Service Worker registered:', reg.scope);
                  }).catch((err) => {
                    console.log('Service Worker registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
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

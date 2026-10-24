import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ShellNav } from "@/components/shell-nav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "VibeZone — Everything your campus needs",
    template: "%s · VibeZone",
  },
  description:
    "Announcements, chat, events, notes, polls and more for the PW IOI campus. One moderated, gamified, mobile-friendly web app.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1120" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-background text-foreground antialiased`}>
        <ThemeProvider>
          <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col">
            <ShellNav />
            <main className="flex-1 px-4 pb-24 pt-4">{children}</main>
            <footer className="border-t border-border px-4 py-4 text-center text-xs text-muted">
              VibeZone · built for the campus · $0 infrastructure
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

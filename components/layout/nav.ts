import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BookOpen,
  Bookmark,
  Building2,
  CalendarDays,
  Compass,
  Crown,
  Gamepad2,
  GraduationCap,
  Home,
  LayoutDashboard,
  Megaphone,
  MessagesSquare,
  PackageSearch,
  Radio,
  ShieldCheck,
  Trophy,
  UserRound,
  Users,
  Vote,
  Settings,
  PlusCircle,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badgeKey?: "messages" | "notifications";
  roles?: string[];
};

export type NavSection = {
  label?: string;
  items: NavItem[];
};

export const MAIN_NAV: NavSection[] = [
  {
    items: [
      { href: "/home", label: "Home", icon: Home, exact: true },
      { href: "/explore", label: "Explore", icon: Compass },
      { href: "/announcements", label: "Announcements", icon: Megaphone },
      { href: "/chat", label: "Chat", icon: MessagesSquare, badgeKey: "messages" },
      { href: "/live", label: "Live", icon: Radio },
      { href: "/events", label: "Events", icon: CalendarDays },
      { href: "/notes", label: "Notes", icon: BookOpen },
      { href: "/polls", label: "Polls", icon: Vote },
      { href: "/games", label: "Games", icon: Gamepad2 },
      { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    ],
  },
  {
    label: "Academics",
    items: [
      { href: "/calendar", label: "Academic Calendar", icon: CalendarDays },
      { href: "/study-groups", label: "Study Groups", icon: Users },
      { href: "/questions", label: "Campus Q&A", icon: MessagesSquare },
      { href: "/placements", label: "Placement Hub", icon: Building2 },
    ],
  },
  {
    label: "Campus life",
    items: [
      { href: "/clubs", label: "Club Elections", icon: Crown },
      { href: "/lost-and-found", label: "Lost & Found", icon: PackageSearch },
      { href: "/mentorship", label: "Seniors Connect", icon: GraduationCap },
      { href: "/feedback", label: "Anonymous Feedback", icon: ShieldCheck },
    ],
  },
  {
    label: "You",
    items: [
      { href: "/create", label: "Create", icon: PlusCircle },
      { href: "/bookmarks", label: "Saved", icon: Bookmark },
      { href: "/notifications", label: "Notifications", icon: Bell, badgeKey: "notifications" },
      { href: "/profile", label: "Profile", icon: UserRound },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export const ADMIN_NAV: NavSection[] = [
  {
    label: "Admin",
    items: [
      { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
      { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
      { href: "/admin/events", label: "Events", icon: CalendarDays },
      { href: "/admin/reports", label: "Reports", icon: ShieldCheck },
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/feedback", label: "Feedback", icon: MessagesSquare },
    ],
  },
  {
    label: "Back to campus",
    items: [{ href: "/home", label: "Home", icon: Home, exact: true }],
  },
];

export const MOBILE_NAV: NavItem[] = [
  { href: "/home", label: "Home", icon: Home, exact: true },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/create", label: "Create", icon: PlusCircle },
  { href: "/chat", label: "Chat", icon: MessagesSquare },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function isItemActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

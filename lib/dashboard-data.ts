import "server-only";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { stripTags } from "@/lib/sanitize";
import { formatISTTime, startOfWeekIST } from "@/lib/time";

/* ============================================================================
 * Dashboard data layer
 * Queries the real database where content exists and falls back to the
 * image-accurate demo content so the dashboard always renders a complete UI.
 * ========================================================================== */

export type DashUser = {
  name: string;
  handle: string;
  role: string;
  avatarUrl: string | null;
  branch: string | null;
  year: number | null;
  email: string;
  branchLabel: string;
};

export type DashStats = {
  xp: number;
  rank: number | null;
  level: number;
  levelName: string;
  levelProgress: number;
  xpToNext: number;
  streak: number;
};

export type DashAnnouncement = {
  id: string;
  title: string;
  category: string;
  pinned: boolean;
  publishLabel: string;
  authorName: string;
  excerpt: string;
};

export type DashEvent = {
  id: string;
  title: string;
  category: string | null;
  location: string | null;
  month: string;
  day: string;
  timeLabel: string;
  going: number;
  capacity: number | null;
  coverImageUrl: string | null;
  externalStreamUrl: string | null;
  isDemo?: boolean;
};

export type DashNote = {
  id: string;
  title: string;
  subject: string;
  uploader: string;
  openCount: number;
  source: string;
  isDemo?: boolean;
};

export type DashLostFound = {
  id: string;
  itemName: string;
  type: "lost" | "found";
  location: string | null;
  createdLabel: string;
  isDemo?: boolean;
};

export type DashSenior = {
  id: string;
  name: string;
  handle: string;
  branchLabel: string;
  tags: string[];
  avatarUrl: string | null;
  requestStatus: string | null;
  isDemo?: boolean;
};

export type DashPoll = {
  id: string;
  question: string;
  options: string[];
  voteCount: number;
  closesAt: string | null;
  votedIndex: number | null;
  isDemo?: boolean;
};

export type DashLeaderboardEntry = {
  rank: number;
  name: string;
  handle: string;
  branchLabel: string;
  points: number;
  avatarUrl: string | null;
};

export type DashChannel = {
  id: string;
  slug: string;
  name: string;
  online: number;
  messages: { name: string; body: string; time: string; avatarUrl: string | null }[];
};

export type DashboardData = {
  user: DashUser;
  isAuthed: boolean;
  stats: DashStats;
  announcements: DashAnnouncement[];
  events: DashEvent[];
  notes: DashNote[];
  lostFound: DashLostFound[];
  seniors: DashSenior[];
  poll: DashPoll;
  leaderboard: { weekly: DashLeaderboardEntry[]; allTime: DashLeaderboardEntry[] };
  you: DashLeaderboardEntry & { branchLabel: string };
  channels: DashChannel[];
};

/* ----------------------------- helpers ---------------------------------- */

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[dashboard] query failed:", err);
    return fallback;
  }
}

/** Word-boundary excerpt so cards never cut mid-word. */
function excerpt(html: string, max = 140): string {
  const clean = stripTags(html);
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > max * 0.5 ? lastSpace : max).trimEnd()}…`;
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "Yesterday";
  if (day < 7) return `${day}d ago`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

function eventParts(date: Date) {
  const month = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", month: "short" })
    .format(date)
    .toUpperCase();
  const day = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric" }).format(date);
  const time = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
  return { month, day, timeLabel: `${time} IST` };
}

function computeLevel(xp: number) {
  const per = 500;
  const level = Math.floor(xp / per) + 1;
  const into = xp % per;
  return { level, levelProgress: into / per, xpToNext: per - into };
}

function levelName(level: number): string {
  if (level >= 9) return "Campus Icon";
  if (level >= 7) return "Campus Legend";
  if (level >= 5) return "Rising Star";
  if (level >= 3) return "Explorer";
  return "Newcomer";
}

/* ----------------------------- demo content ------------------------------ */

const DEMO_USER: DashUser = {
  name: "Aarav Mehta",
  handle: "aarav.m",
  role: "student",
  avatarUrl: "preset:grape",
  branch: "CSE",
  year: 2,
  email: "aarav.m@pwioi.com",
  branchLabel: "CSE '27",
};

const DEMO_STATS: DashStats = {
  xp: 2340,
  rank: 14,
  level: 7,
  levelName: "Campus Legend",
  levelProgress: 0.53,
  xpToNext: 380,
  streak: 12,
};

const DEMO_ANNOUNCEMENTS: DashAnnouncement[] = [
  {
    id: "demo-a1",
    title: "Mid-semester exam schedule released",
    category: "Academic",
    pinned: true,
    publishLabel: "2h ago",
    authorName: "Academic Office",
    excerpt: "Exams run Mar 18–26. Seating plans and hall tickets now live on the portal. Check your block and reporting time.",
  },
  {
    id: "demo-a2",
    title: "Central library open till 2 AM during exams",
    category: "Campus",
    pinned: false,
    publishLabel: "Yesterday",
    authorName: "Library Committee",
    excerpt: "Reading halls, Wi-Fi and the reference desk stay open late through the exam window. Carry your ID card.",
  },
  {
    id: "demo-a3",
    title: "Wi-Fi maintenance — Block B & C, Sat 10 AM",
    category: "Hostel",
    pinned: false,
    publishLabel: "24h ago",
    authorName: "IT Cell",
    excerpt: "Expect a 2-hour outage while we upgrade the access points. Plan downloads around the window.",
  },
];

function demoEvents(): DashEvent[] {
  const base = Date.now();
  const at = (days: number, hour: number) => {
    const d = new Date(base + days * 86_400_000);
    d.setHours(hour, 0, 0, 0);
    return d;
  };
  return [
    {
      id: "demo-e1",
      title: "TechNova '25 Hackathon",
      category: "Hackathon",
      location: "Innovation Lab",
      ...eventParts(at(2, 9)),
      going: 88,
      capacity: 120,
      coverImageUrl: null,
      externalStreamUrl: null,
      isDemo: true,
    },
    {
      id: "demo-e2",
      title: "Rang Utsav — Cultural Night",
      category: "Cultural",
      location: "Open Air Theatre",
      ...eventParts(at(3, 18)),
      going: 143,
      capacity: null,
      coverImageUrl: null,
      externalStreamUrl: null,
      isDemo: true,
    },
    {
      id: "demo-e3",
      title: "Placement AMA with Alumni",
      category: "Placement",
      location: "Seminar Hall + Live stream",
      ...eventParts(at(5, 15)),
      going: 54,
      capacity: 100,
      coverImageUrl: null,
      externalStreamUrl: null,
      isDemo: true,
    },
  ];
}

const DEMO_NOTES: DashNote[] = [
  {
    id: "demo-n1",
    title: "Graphs & DP — Complete Handout",
    subject: "DSA",
    uploader: "by Riya S. · Senior",
    openCount: 142,
    source: "Drive",
    isDemo: true,
  },
  {
    id: "demo-n2",
    title: "Normalization Cheatsheet + PYQs",
    subject: "DBMS",
    uploader: "by Kabir M.",
    openCount: 96,
    source: "Drive",
    isDemo: true,
  },
  {
    id: "demo-n3",
    title: "Process Scheduling — Lecture Notes",
    subject: "Operating Systems",
    uploader: "by Prof. Iyer",
    openCount: 76,
    source: "OneDrive",
    isDemo: true,
  },
];

const DEMO_LOSTFOUND: DashLostFound[] = [
  {
    id: "demo-l1",
    itemName: "Black earbuds case",
    type: "found",
    location: "Found near Library",
    createdLabel: "2h ago",
    isDemo: true,
  },
  {
    id: "demo-l2",
    itemName: "Casio fx-991 calculator",
    type: "lost",
    location: "Last seen near Mech Workshop",
    createdLabel: "5h ago",
    isDemo: true,
  },
];

const DEMO_SENIORS: DashSenior[] = [
  {
    id: "demo-s1",
    name: "Ananya Rao",
    handle: "ananya.r",
    branchLabel: "CSE '26 · AI/ML · 4th Year",
    tags: ["DSA", "Placements", "Open Source"],
    avatarUrl: "preset:rose",
    requestStatus: null,
    isDemo: true,
  },
  {
    id: "demo-s2",
    name: "Kabir Singh",
    handle: "kabir.s",
    branchLabel: "CSE '26 · GATE · AIR 432",
    tags: ["GATE", "VLSI", "Research"],
    avatarUrl: "preset:ocean",
    requestStatus: "pending",
    isDemo: true,
  },
  {
    id: "demo-s3",
    name: "Maera Pillai",
    handle: "maera.p",
    branchLabel: "IT '26 · Product · ex-Google",
    tags: ["Clubs", "Hackathons", "Hostel life"],
    avatarUrl: "preset:forest",
    requestStatus: null,
    isDemo: true,
  },
];

function demoPoll(): DashPoll {
  return {
    id: "demo-poll",
    question: "Which canteen item deserves a permanent comeback?",
    options: ["Midnight Maggi Combo", "Paneer Frankie", "₹20 Cold Coffee Dosa", "Masala Dosa Fridays"],
    voteCount: 131,
    closesAt: new Date(Date.now() + 6 * 3_600_000).toISOString(),
    votedIndex: null,
    isDemo: true,
  };
}

const DEMO_WEEKLY: DashLeaderboardEntry[] = [
  { rank: 1, name: "Ishita Verma", handle: "ishita.v", branchLabel: "CSE '26", points: 4820, avatarUrl: "preset:sunset" },
  { rank: 2, name: "Navi Malhotra", handle: "navi.m", branchLabel: "ECE '26", points: 4315, avatarUrl: "preset:ocean" },
  { rank: 3, name: "Sana Punjabi", handle: "sana.p", branchLabel: "CSE '26", points: 3990, avatarUrl: "preset:forest" },
  { rank: 4, name: "Arjun Nair", handle: "arjun.n", branchLabel: "Mech '26", points: 3612, avatarUrl: "preset:gold" },
];

const DEMO_ALLTIME: DashLeaderboardEntry[] = [
  { rank: 1, name: "Ishita Verma", handle: "ishita.v", branchLabel: "CSE '26", points: 18_420, avatarUrl: "preset:sunset" },
  { rank: 2, name: "Arjun Nair", handle: "arjun.n", branchLabel: "Mech '26", points: 17_260, avatarUrl: "preset:gold" },
  { rank: 3, name: "Navi Malhotra", handle: "navi.m", branchLabel: "ECE '26", points: 16_905, avatarUrl: "preset:ocean" },
  { rank: 4, name: "Sana Punjabi", handle: "sana.p", branchLabel: "CSE '26", points: 15_640, avatarUrl: "preset:forest" },
];

const DEMO_YOU: DashLeaderboardEntry & { branchLabel: string } = {
  rank: 14,
  name: "Aarav Mehta",
  handle: "aarav.m",
  branchLabel: "CSE '27",
  points: 2340,
  avatarUrl: "preset:grape",
};

const DEMO_CHANNELS: DashChannel[] = [
  {
    id: "demo-general",
    slug: "general",
    name: "general-yp",
    online: 63,
    messages: [
      { name: "Rahul K", body: "anyone has the CN lab manual? pls", time: "9:41", avatarUrl: "preset:ocean" },
      { name: "Midnight Owl", body: "It's in Notes → Computer Networks, Riya dropped it", time: "9:42", avatarUrl: "preset:grape" },
      { name: "Sana Q", body: "CSE Phantoms clutching in match 3 watch live", time: "9:44", avatarUrl: "preset:sunset" },
    ],
  },
];

/* ----------------------------- real queries ------------------------------ */

async function getLeaderboard(period: "week" | "all"): Promise<DashLeaderboardEntry[]> {
  const where: Record<string, unknown> = {};
  if (period === "week") {
    const weekStart = startOfWeekIST();
    where.bucketDate = { gte: new Date(`${weekStart.toISOString().slice(0, 10)}T00:00:00.000Z`) };
  }

  const rows = await db.pointLedger.groupBy({
    by: ["userId"],
    where,
    _sum: { points: true },
    orderBy: { _sum: { points: "desc" } },
    take: 10,
  });
  if (rows.length === 0) return [];

  const users = await db.user.findMany({
    where: { id: { in: rows.map((r) => r.userId) }, status: "active" },
    select: { id: true, name: true, handle: true, branch: true, year: true, avatarUrl: true },
  });
  const map = new Map(users.map((u) => [u.id, u]));

  return rows
    .map((r, i) => {
      const u = map.get(r.userId);
      if (!u) return null;
      return {
        rank: i + 1,
        name: u.name,
        handle: u.handle,
        branchLabel: u.branch ? `${u.branch}${u.year ? ` · Y${u.year}` : ""}` : "PW IOI",
        points: r._sum.points ?? 0,
        avatarUrl: u.avatarUrl,
      };
    })
    .filter((x): x is DashLeaderboardEntry => x !== null);
}

async function getTodayPoll(userId?: string): Promise<DashPoll | null> {
  const now = new Date();
  const poll = await db.poll.findFirst({
    where: { status: "open", opensAt: { lte: now }, closesAt: { gt: now } },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { votes: true } } },
  });
  if (!poll) return null;

  let votedIndex: number | null = null;
  if (userId) {
    const vote = await db.pollVote.findUnique({
      where: { pollId_userId: { pollId: poll.id, userId } },
    });
    votedIndex = vote?.optionIndex ?? null;
  }

  return {
    id: poll.id,
    question: poll.question,
    options: poll.options as string[],
    voteCount: poll._count.votes,
    closesAt: poll.closesAt?.toISOString() ?? null,
    votedIndex,
  };
}

async function getChannels(): Promise<DashChannel[]> {
  const channels = await db.channel.findMany({
    where: { type: "global", archivedAt: null },
    orderBy: { createdAt: "asc" },
    take: 1,
    include: {
      messages: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { sender: { select: { name: true, avatarUrl: true } } },
      },
      _count: { select: { members: true } },
    },
  });

  return channels.map((c) => {
    const messages = c.messages
      .slice()
      .reverse()
      .map((m) => ({
        name: m.sender.name,
        body: m.body.slice(0, 120),
        time: formatISTTime(m.createdAt),
        avatarUrl: m.sender.avatarUrl,
      }));

    return {
      id: c.id,
      slug: c.slug,
      name: c.name,
      // No presence tracking yet — fall back to the demo crowd size so the
      // preview never reads "0 online" on a fresh install.
      online: c._count.members > 0 ? c._count.members : DEMO_CHANNELS[0].online,
      messages: messages.length > 0 ? messages : DEMO_CHANNELS[0].messages,
    };
  });
}

/* ----------------------------- public entry ------------------------------ */

export async function getDashboardData(): Promise<DashboardData> {
  const me = await getCurrentUser();

  const [announcements, events, notes, lostFound, seniors, poll, weekly, allTime, channels] =
    await Promise.all([
      safe(
        () =>
          db.announcement.findMany({
            where: {
              archivedAt: null,
              publishAt: { lte: new Date() },
              OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
            orderBy: [{ pinned: "desc" }, { publishAt: "desc" }],
            take: 3,
            include: { author: { select: { name: true } } },
          }),
        [],
      ),
      safe(
        () =>
          db.event.findMany({
            where: { status: "published", startsAt: { gte: new Date(Date.now() - 12 * 3_600_000) } },
            orderBy: { startsAt: "asc" },
            take: 3,
            include: { _count: { select: { rsvps: { where: { status: "going" } } } } },
          }),
        [],
      ),
      safe(
        () =>
          db.note.findMany({
            where: { removedAt: null },
            orderBy: [{ openCount: "desc" }, { createdAt: "desc" }],
            take: 3,
            include: { uploader: { select: { name: true, handle: true } } },
          }),
        [],
      ),
      safe(
        () =>
          db.lostAndFound.findMany({
            where: { removedAt: null },
            orderBy: { createdAt: "desc" },
            take: 2,
          }),
        [],
      ),
      safe(
        () =>
          db.user.findMany({
            where: { role: "senior", status: "active" },
            select: { id: true, name: true, handle: true, branch: true, year: true, expertise: true, avatarUrl: true },
            take: 3,
          }),
        [],
      ),
      safe(() => getTodayPoll(me?.id), null),
      safe(() => getLeaderboard("week"), []),
      safe(() => getLeaderboard("all"), []),
      safe(() => getChannels(), []),
    ]);

  // ----- user -----
  const user: DashUser = me
    ? {
        name: me.name,
        handle: me.handle,
        role: me.role,
        avatarUrl: me.avatarUrl,
        branch: me.branch,
        year: me.year,
        email: me.email,
        branchLabel: me.branch ? `${me.branch}${me.year ? ` · Y${me.year}` : ""}` : "PW IOI",
      }
    : DEMO_USER;

  // ----- points / stats -----
  let xp = DEMO_STATS.xp;
  if (me) {
    const agg = await safe(
      () => db.pointLedger.aggregate({ _sum: { points: true }, where: { userId: me.id } }),
      { _sum: { points: 0 } } as { _sum: { points: number | null } },
    );
    xp = agg._sum.points ?? 0;
  }

  const weeklyList = weekly.length > 0 ? weekly : DEMO_WEEKLY;
  const allTimeList = allTime.length > 0 ? allTime : DEMO_ALLTIME;

  const myRank = me ? (weeklyList.find((e) => e.handle === me.handle)?.rank ?? null) : DEMO_STATS.rank;
  const level = me ? computeLevel(xp) : { level: DEMO_STATS.level, levelProgress: DEMO_STATS.levelProgress, xpToNext: DEMO_STATS.xpToNext };

  const stats: DashStats = me
    ? {
        xp,
        rank: myRank,
        level: level.level,
        levelName: levelName(level.level),
        levelProgress: level.levelProgress,
        xpToNext: level.xpToNext,
        streak: 12,
      }
    : DEMO_STATS;

  const you: DashLeaderboardEntry & { branchLabel: string } = me
    ? {
        rank: myRank ?? 0,
        name: me.name,
        handle: me.handle,
        branchLabel: user.branchLabel,
        points: xp,
        avatarUrl: me.avatarUrl,
      }
    : DEMO_YOU;

  // ----- announcements -----
  const announcementList: DashAnnouncement[] =
    announcements.length > 0
      ? announcements.map((a) => ({
          id: a.id,
          title: a.title,
          category: a.category,
          pinned: a.pinned,
          publishLabel: timeAgo(a.publishAt),
          authorName: a.author.name,
          excerpt: excerpt(a.body),
        }))
      : DEMO_ANNOUNCEMENTS;

  // ----- events -----
  const eventList: DashEvent[] =
    events.length > 0
      ? events.map((e) => ({
          id: e.id,
          title: e.title,
          category: e.category,
          location: e.location,
          ...eventParts(e.startsAt),
          going: e._count.rsvps,
          capacity: e.capacity,
          coverImageUrl: e.coverImageUrl,
          externalStreamUrl: e.externalStreamUrl,
        }))
      : demoEvents();

  // ----- notes -----
  const noteList: DashNote[] =
    notes.length > 0
      ? notes.map((n) => ({
          id: n.id,
          title: n.title,
          subject: n.subject,
          uploader: `by ${n.uploader.name}`,
          openCount: n.openCount,
          source: /drive\.google/i.test(n.externalLink) ? "Drive" : /onedrive|sharepoint/i.test(n.externalLink) ? "OneDrive" : "Link",
        }))
      : DEMO_NOTES;

  // ----- lost & found -----
  const lostList: DashLostFound[] =
    lostFound.length > 0
      ? lostFound.map((l) => ({
          id: l.id,
          itemName: l.itemName,
          type: l.type as "lost" | "found",
          location: l.location,
          createdLabel: timeAgo(l.createdAt),
        }))
      : DEMO_LOSTFOUND;

  // ----- seniors -----
  let seniorList: DashSenior[] = [];
  if (seniors.length > 0) {
    const requestMap = new Map<string, string>();
    if (me) {
      const reqs = await safe(
        () => db.mentorshipRequest.findMany({ where: { studentId: me.id }, select: { seniorId: true, status: true } }),
        [],
      );
      for (const r of reqs) requestMap.set(r.seniorId, r.status);
    }
    seniorList = seniors.map((s) => ({
      id: s.id,
      name: s.name,
      handle: s.handle,
      branchLabel: s.branch ? `${s.branch}${s.year ? ` · Y${s.year}` : ""}` : "Senior",
      tags: Array.isArray(s.expertise) ? (s.expertise as unknown[]).filter((t): t is string => typeof t === "string") : [],
      avatarUrl: s.avatarUrl,
      requestStatus: requestMap.get(s.id) ?? null,
    }));
  }
  if (seniorList.length === 0) seniorList = DEMO_SENIORS;

  return {
    user,
    isAuthed: Boolean(me),
    stats,
    announcements: announcementList,
    events: eventList,
    notes: noteList,
    lostFound: lostList,
    seniors: seniorList,
    poll: poll ?? demoPoll(),
    leaderboard: { weekly: weeklyList, allTime: allTimeList },
    you,
    channels: channels.length > 0 ? channels : DEMO_CHANNELS,
  };
}

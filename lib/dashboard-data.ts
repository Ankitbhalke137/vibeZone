import "server-only";

import { db } from "@/lib/db";
import { getCurrentUser, type SafeUser } from "@/lib/auth";
import { stripTags } from "@/lib/sanitize";
import { formatISTTime, startOfWeekIST } from "@/lib/time";

/* ============================================================================
 * Dashboard data layer — real database content only.
 * Empty arrays/null are returned when campus has no content yet so the UI can
 * show honest empty states instead of invented activity.
 * ========================================================================== */

export type DashUser = {
  id: string;
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
  startsAt: string;
  going: number;
  capacity: number | null;
  coverImageUrl: string | null;
  externalStreamUrl: string | null;
};

export type DashNote = {
  id: string;
  title: string;
  subject: string;
  uploader: string;
  openCount: number;
  source: string;
};

export type DashLostFound = {
  id: string;
  itemName: string;
  type: "lost" | "found";
  location: string | null;
  createdLabel: string;
};

export type DashSenior = {
  id: string;
  name: string;
  handle: string;
  branchLabel: string;
  tags: string[];
  avatarUrl: string | null;
  requestStatus: string | null;
};

export type DashPoll = {
  id: string;
  question: string;
  options: string[];
  voteCount: number;
  closesAt: string | null;
  votedIndex: number | null;
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
  stats: DashStats;
  announcements: DashAnnouncement[];
  events: DashEvent[];
  notes: DashNote[];
  lostFound: DashLostFound[];
  seniors: DashSenior[];
  poll: DashPoll | null;
  leaderboard: { weekly: DashLeaderboardEntry[]; allTime: DashLeaderboardEntry[] };
  you: DashLeaderboardEntry;
  channels: DashChannel[];
  counts: {
    posts: number;
    events: number;
    notes: number;
    lostFound: number;
    mentors: number;
  };
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

function branchLabel(branch: string | null, year: number | null) {
  if (!branch) return "PW IOI";
  return `${branch}${year ? ` · Y${year}` : ""}`;
}

/** Consecutive days with any points activity, ending today or yesterday. */
async function computeStreak(userId: string): Promise<number> {
  const rows = await db.pointLedger.findMany({
    where: { userId },
    select: { bucketDate: true },
    orderBy: { bucketDate: "desc" },
    take: 400,
  });
  const days = [...new Set(rows.map((r) => r.bucketDate.toISOString().slice(0, 10)))];
  if (days.length === 0) return 0;

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  if (days[0] !== today && days[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(`${days[i - 1]}T00:00:00.000Z`).getTime();
    const next = new Date(`${days[i]}T00:00:00.000Z`).getTime();
    if (Math.round((prev - next) / 86_400_000) === 1) streak++;
    else break;
  }
  return streak;
}

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
    take: 20,
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
        branchLabel: branchLabel(u.branch, u.year),
        points: r._sum.points ?? 0,
        avatarUrl: u.avatarUrl,
      };
    })
    .filter((x): x is DashLeaderboardEntry => x !== null);
}

async function getTodayPoll(userId: string): Promise<DashPoll | null> {
  const now = new Date();
  const poll = await db.poll.findFirst({
    where: { status: "open", opensAt: { lte: now }, closesAt: { gt: now } },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { votes: true } } },
  });
  if (!poll) return null;

  const vote = await db.pollVote.findUnique({
    where: { pollId_userId: { pollId: poll.id, userId } },
  });

  return {
    id: poll.id,
    question: poll.question,
    options: poll.options as string[],
    voteCount: poll._count.votes,
    closesAt: poll.closesAt?.toISOString() ?? null,
    votedIndex: vote?.optionIndex ?? null,
  };
}

async function getChannels(): Promise<DashChannel[]> {
  const channels = await db.channel.findMany({
    where: { type: "global", archivedAt: null },
    orderBy: { createdAt: "asc" },
    take: 3,
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

  return channels.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    online: c._count.members,
    messages: c.messages
      .slice()
      .reverse()
      .map((m) => ({
        name: m.sender.name,
        body: m.body.slice(0, 120),
        time: formatISTTime(m.createdAt),
        avatarUrl: m.sender.avatarUrl,
      })),
  }));
}

/* ----------------------------- public entry ------------------------------ */

export async function getDashboardData(): Promise<DashboardData | null> {
  const me: SafeUser | null = await getCurrentUser();
  if (!me) return null;

  const [
    announcements,
    events,
    notes,
    lostFound,
    seniors,
    poll,
    weekly,
    allTime,
    channels,
    xpAgg,
    streak,
    counts,
  ] = await Promise.all([
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
          include: { uploader: { select: { name: true } } },
        }),
      [],
    ),
    safe(
      () =>
        db.lostAndFound.findMany({
          where: { removedAt: null, status: "open" },
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
    safe(() => getTodayPoll(me.id), null),
    safe(() => getLeaderboard("week"), []),
    safe(() => getLeaderboard("all"), []),
    safe(() => getChannels(), []),
    safe(
      () => db.pointLedger.aggregate({ _sum: { points: true }, where: { userId: me.id } }),
      { _sum: { points: 0 } } as { _sum: { points: number | null } },
    ),
    safe(() => computeStreak(me.id), 0),
    safe(
      () =>
        Promise.all([
          db.post.count({ where: { deletedAt: null } }),
          db.event.count({ where: { status: "published", startsAt: { gte: new Date() } } }),
          db.note.count({ where: { removedAt: null } }),
          db.lostAndFound.count({ where: { removedAt: null, status: "open" } }),
          db.user.count({ where: { role: "senior", status: "active" } }),
        ]),
      [0, 0, 0, 0, 0],
    ),
  ]);

  const xp = xpAgg._sum.points ?? 0;
  const level = computeLevel(xp);

  const weeklyList = weekly;
  const allTimeList = allTime;

  const myWeekly = weeklyList.find((e) => e.handle === me.handle)?.rank ?? null;
  const myAllTime = allTimeList.find((e) => e.handle === me.handle)?.rank ?? null;
  const myRank = myWeekly ?? myAllTime ?? null;

  let requestMap = new Map<string, string>();
  if (seniors.length > 0) {
    const reqs = await safe(
      () => db.mentorshipRequest.findMany({ where: { studentId: me.id }, select: { seniorId: true, status: true } }),
      [],
    );
    requestMap = new Map(reqs.map((r) => [r.seniorId, r.status]));
  }

  return {
    user: {
      id: me.id,
      name: me.name,
      handle: me.handle,
      role: me.role,
      avatarUrl: me.avatarUrl,
      branch: me.branch,
      year: me.year,
      email: me.email,
      branchLabel: branchLabel(me.branch, me.year),
    },
    stats: {
      xp,
      rank: myRank,
      level: level.level,
      levelName: levelName(level.level),
      levelProgress: level.levelProgress,
      xpToNext: level.xpToNext,
      streak,
    },
    announcements: announcements.map((a) => ({
      id: a.id,
      title: a.title,
      category: a.category,
      pinned: a.pinned,
      publishLabel: timeAgo(a.publishAt),
      authorName: a.author.name,
      excerpt: excerpt(a.body),
    })),
    events: events.map((e) => ({
      id: e.id,
      title: e.title,
      category: e.category,
      location: e.location,
      ...eventParts(e.startsAt),
      startsAt: e.startsAt.toISOString(),
      going: e._count.rsvps,
      capacity: e.capacity,
      coverImageUrl: e.coverImageUrl,
      externalStreamUrl: e.externalStreamUrl,
    })),
    notes: notes.map((n) => ({
      id: n.id,
      title: n.title,
      subject: n.subject,
      uploader: `by ${n.uploader.name}`,
      openCount: n.openCount,
      source: /drive\.google/i.test(n.externalLink)
        ? "Drive"
        : /onedrive|sharepoint/i.test(n.externalLink)
          ? "OneDrive"
          : "Link",
    })),
    lostFound: lostFound.map((l) => ({
      id: l.id,
      itemName: l.itemName,
      type: l.type as "lost" | "found",
      location: l.location,
      createdLabel: timeAgo(l.createdAt),
    })),
    seniors: seniors.map((s) => ({
      id: s.id,
      name: s.name,
      handle: s.handle,
      branchLabel: branchLabel(s.branch, s.year),
      tags: Array.isArray(s.expertise)
        ? (s.expertise as unknown[]).filter((t): t is string => typeof t === "string")
        : [],
      avatarUrl: s.avatarUrl,
      requestStatus: requestMap.get(s.id) ?? null,
    })),
    poll,
    leaderboard: { weekly: weeklyList, allTime: allTimeList },
    you: {
      rank: myRank ?? 0,
      name: me.name,
      handle: me.handle,
      branchLabel: branchLabel(me.branch, me.year),
      points: xp,
      avatarUrl: me.avatarUrl,
    },
    channels,
    counts: {
      posts: counts[0] ?? 0,
      events: counts[1] ?? 0,
      notes: counts[2] ?? 0,
      lostFound: counts[3] ?? 0,
      mentors: counts[4] ?? 0,
    },
  };
}

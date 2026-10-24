/**
 * VibeZone seed (plan §3, Weeks 1–3 portion):
 *  · system user (owns seeded announcements, FK target)
 *  · 5 global channels (PRD FR-CHAT-001)
 *  · 5 welcome announcements (PRD Appendix B)
 * Idempotent — safe to run repeatedly:  npm run db:seed
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const SYSTEM_EMAIL = "vibezone-system@pwioi.com";

const channels = [
  { slug: "general", name: "general", topic: "Announcements, intros and campus chatter" },
  { slug: "help", name: "help", topic: "Ask anything — someone always answers" },
  { slug: "placements", name: "placements", topic: "Drives, prep and opportunity sharing" },
  { slug: "memes", name: "memes", topic: "Strictly for the laughs" },
  { slug: "random", name: "random", topic: "Off-topic anything goes" },
];

const announcements = [
  {
    title: "Welcome to VibeZone 🎉",
    category: "Academic",
    pinned: true,
    body: "<p>VibeZone is your campus in one place: <b>announcements, chat, events, notes, polls</b> and more. Sign in with your college email to get started — no passwords, just a one-time code.</p><p>Be kind. Moderated aliases are available in chat if you want to speak freely.</p>",
  },
  {
    title: "How sign-in works (campus email only)",
    category: "Academic",
    pinned: false,
    body: "<p>1. Tap <b>Sign in</b> → enter your <b>@pwioi.com</b> email.<br>2. Check your inbox (and spam) for a 6-digit code.<br>3. Code expires in 10 minutes — request a new one if needed.</p>",
  },
  {
    title: "Wi-Fi & campus access guide",
    category: "Hostel",
    pinned: false,
    body: "<p>Campus Wi-Fi credentials, lab hours and library access rules — collected in one place so nobody has to dig through old messages again.</p>",
  },
  {
    title: "Club sign-ups are open",
    category: "Clubs",
    pinned: false,
    body: "<p>Robotics, coding, cultural and sports clubs are taking new members this term. Watch the <b>Events</b> tab for intro sessions.</p>",
  },
  {
    title: "Exam schedule placeholder",
    category: "Urgent",
    pinned: false,
    body: "<p>Mid-term dates will be pinned here the moment they're official. Keep notifications on.</p>",
  },
];

async function main() {
  const system = await db.user.upsert({
    where: { email: SYSTEM_EMAIL },
    update: {},
    create: {
      email: SYSTEM_EMAIL,
      handle: "vibezone",
      name: "VibeZone Team",
      role: "admin",
      onboardedAt: new Date(),
    },
  });
  console.log(`✓ system user: ${system.email}`);

  for (const c of channels) {
    await db.channel.upsert({
      where: { slug: c.slug },
      update: {},
      create: { ...c, type: "global", createdBy: system.id },
    });
  }
  console.log(`✓ ${channels.length} channels`);

  for (const a of announcements) {
    const exists = await db.announcement.findFirst({ where: { title: a.title } });
    if (!exists) await db.announcement.create({ data: { ...a, authorId: system.id } });
  }
  console.log(`✓ ${announcements.length} announcements`);

  const [users, msgs] = await Promise.all([db.user.count(), db.message.count()]);
  console.log(`— totals: ${users} users, ${msgs} messages`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

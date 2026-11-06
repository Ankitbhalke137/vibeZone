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

  await seedDemo(system.id);
  await seedQuiz();

  const [users, msgs] = await Promise.all([db.user.count(), db.message.count()]);
  console.log(`— totals: ${users} users, ${msgs} messages`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

// ─────────────────────────────────────────────────────────────
// Demo campus data — makes every module reviewable out of the box.
// Idempotent: each row is looked up before it is created.
// ─────────────────────────────────────────────────────────────

function at(offsetDays: number, hour = 10, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function seedDemo(systemId: string) {
  const demoUsers = [
    { email: "ananya@pwioi.com", handle: "ananya", name: "Ananya Rao", role: "senior", branch: "CSE", year: 4, avatar: "preset:aurora", bio: "Final-year CSE · DSA & placements mentor", expertise: ["DSA", "Placements"] },
    { email: "rohan@pwioi.com", handle: "rohan", name: "Rohan Mehta", role: "senior", branch: "ECE", year: 4, avatar: "preset:ocean", bio: "ECE senior · higher studies and research", expertise: ["Higher studies", "Projects"] },
    { email: "isha@pwioi.com", handle: "isha", name: "Isha Kapoor", role: "student", branch: "CSE", year: 2, avatar: "preset:sunset", bio: "Second-year CSE · building side projects", expertise: null },
    { email: "kabir@pwioi.com", handle: "kabir", name: "Kabir Singh", role: "student", branch: "IT", year: 1, avatar: "preset:forest", bio: "First-year IT · figuring things out", expertise: null },
    { email: "meera@pwioi.com", handle: "meera", name: "Meera Nair", role: "club_leader", branch: "CSE", year: 3, avatar: "preset:grape", bio: "Coding club lead · organises hack nights", expertise: null },
    { email: "arjun@pwioi.com", handle: "arjun", name: "Arjun Desai", role: "student", branch: "ME", year: 2, avatar: "preset:gold", bio: "Mech eng · football and CAD", expertise: null },
    { email: "zoya@pwioi.com", handle: "zoya", name: "Zoya Khan", role: "moderator", branch: "ECE", year: 3, avatar: "preset:rose", bio: "Community moderator · keep it kind", expertise: null },
    { email: "dev@pwioi.com", handle: "dev", name: "Dev Patel", role: "senior", branch: "CSE", year: 4, avatar: "preset:mint", bio: "Design + startups · happy to review portfolios", expertise: ["Startup", "Design"] },
    { email: "naina@pwioi.com", handle: "naina", name: "Naina Verma", role: "student", branch: "CSE", year: 3, avatar: "preset:aurora", bio: "Third-year CSE · ML enthusiast", expertise: null },
    { email: "vikram@pwioi.com", handle: "vikram", name: "Vikram Joshi", role: "student", branch: "CE", year: 2, avatar: "preset:forest", bio: "Civil engineering · campus photography", expertise: null },
  ];

  const users: Record<string, { id: string; name: string; handle: string }> = {};
  for (const u of demoUsers) {
    const row = await db.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        handle: u.handle,
        name: u.name,
        role: u.role,
        branch: u.branch,
        year: u.year,
        avatarUrl: u.avatar,
        bio: u.bio,
        expertise: u.expertise ?? undefined,
        onboardedAt: new Date(),
      },
      select: { id: true, name: true, handle: true },
    });
    users[u.handle] = row;
  }
  console.log(`✓ ${demoUsers.length} demo users`);

  // ── Events ────────────────────────────────────────────────
  const events = [
    { title: "Hack Night: Build for Campus", category: "Tech", location: "Innovation Lab, Block C", days: 3, hour: 18, capacity: 80, stream: "https://www.youtube.com/watch?v=jfKfPfyJRdk", cover: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80", description: "An overnight build sprint for campus tools. Teams of 2–4, mentors on the floor, pizza at midnight. Bring a laptop and an idea." },
    { title: "Intro to Machine Learning Workshop", category: "Academic", location: "Seminar Hall 2", days: 2, hour: 15, capacity: 60, stream: null, cover: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80", description: "Hands-on session covering regression, classification, and a first scikit-learn model. No prior ML needed." },
    { title: "Open Mic & Acoustic Evening", category: "Cultural", location: "Amphitheatre", days: 6, hour: 19, capacity: 150, stream: null, cover: "https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&w=1200&q=80", description: "Poetry, stand-up, and acoustic sets under the stars. Sign-up sheet at the student desk." },
    { title: "Placement Prep Bootcamp", category: "Placement", location: "Auditorium", days: 10, hour: 11, capacity: 120, stream: "https://www.youtube.com/watch?v=21X5lGlDOfg", cover: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80", description: "Resume clinics, mock interviews, and a panel with recent graduates now working in product and consulting." },
    { title: "Inter-Branch Football Finals", category: "Sports", location: "Main Ground", days: 13, hour: 16, capacity: 200, stream: null, cover: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80", description: "CSE vs ME for the campus cup. Come early for the best view of the north stand." },
    { title: "Freshers' Orientation", category: "Academic", location: "Auditorium", days: -20, hour: 9, capacity: 300, stream: null, cover: null, description: "Welcome session for the incoming batch — campus tour, clubs fair, and the IT desk." },
  ];
  for (const e of events) {
    const exists = await db.event.findFirst({ where: { title: e.title } });
    if (!exists) {
      await db.event.create({
        data: {
          title: e.title,
          description: e.description,
          category: e.category,
          location: e.location,
          startsAt: at(e.days, e.hour),
          endsAt: new Date(at(e.days, e.hour).getTime() + 3 * 3_600_000),
          capacity: e.capacity,
          coverImageUrl: e.cover ?? undefined,
          externalStreamUrl: e.stream ?? undefined,
          createdBy: systemId,
        },
      });
    }
  }
  const eventRows = await db.event.findMany({ orderBy: { startsAt: "asc" } });
  const demoHandles = ["isha", "kabir", "arjun", "naina", "vikram", "meera"];
  for (const [i, event] of eventRows.entries()) {
    const userId = users[demoHandles[i % demoHandles.length]].id;
    await db.eventRsvp.upsert({
      where: { eventId_userId: { eventId: event.id, userId } },
      update: {},
      create: { eventId: event.id, userId, status: i === 3 ? "maybe" : "going" },
    });
  }
  console.log(`✓ ${events.length} events + RSVPs`);

  // ── Notes ─────────────────────────────────────────────────
  const notes = [
    { title: "DSA Complete Revision Notes", subject: "Data Structures", branch: "CSE", year: 2, semester: 3, type: "Notes", link: "https://drive.google.com/drive/folders/1A2bC3dE4fG5hI6jK7lM8nO9pQ", by: "ananya", description: "Arrays → graphs, with complexity cheat-sheets and 60 solved patterns." },
    { title: "Operating Systems PYQs (2019–2025)", subject: "Operating Systems", branch: "CSE", year: 3, semester: 5, type: "PYQ", link: "https://drive.google.com/drive/folders/1PqRsTuVwXyZaBcDeFgHiJkLm", by: "naina", description: "Seven years of mid-sem and end-sem papers, sorted by unit." },
    { title: "Digital Electronics Lab Manual", subject: "Digital Electronics", branch: "ECE", year: 2, semester: 3, type: "Lab", link: "https://drive.google.com/drive/folders/1ZzYyXxWwVvUuTtSsRrQqPpOo", by: "rohan", description: "Every experiment with expected waveforms and viva questions." },
    { title: "Engineering Mathematics II Slides", subject: "Mathematics", branch: "CSE", year: 1, semester: 2, type: "Slides", link: "https://drive.google.com/drive/folders/1MmNnOoPpQqRrSsTtUuVvWwXx", by: "kabir", description: "Full lecture deck covering linear algebra and differential equations." },
    { title: "DBMS Normalization Cheat Sheet", subject: "DBMS", branch: "IT", year: 2, semester: 4, type: "Notes", link: "https://drive.google.com/drive/folders/1QqWwEeRrTtYyUuIiOoPpAaSs", by: "isha", description: "1NF to BCNF in one page, with worked examples." },
    { title: "Placement Interview Question Bank", subject: "Placements", branch: "CSE", year: 4, semester: 7, type: "Other", link: "https://drive.google.com/drive/folders/1AaSsDdFfGgHhJjKkLlZzXxCc", by: "dev", description: "200+ questions from campus drives, grouped by company and role." },
  ];
  for (const n of notes) {
    const exists = await db.note.findFirst({ where: { title: n.title } });
    if (!exists) {
      await db.note.create({
        data: {
          title: n.title,
          description: n.description,
          subject: n.subject,
          branch: n.branch,
          year: n.year,
          semester: n.semester,
          type: n.type,
          externalLink: n.link,
          openCount: Math.floor(Math.random() * 80) + 12,
          uploadedBy: users[n.by].id,
        },
      });
    }
  }
  console.log(`✓ ${notes.length} notes`);

  // ── Polls ─────────────────────────────────────────────────
  const polls = [
    { question: "Where should the next campus trip go?", options: ["Manali", "Goa", "Rishikesh", "Coorg"], status: "open", opens: -1, closes: 3, votes: [0, 1, 0, 0, 0, 1, 2, 3, 0, 1] },
    { question: "Best late-night study spot on campus?", options: ["Library 2nd floor", "Hostel common room", "24×7 lab", "Cafeteria"], status: "open", opens: -2, closes: 2, votes: [0, 3, 1, 2, 0, 1, 2, 0, 3, 1] },
    { question: "Which club should host the next workshop?", options: ["Coding Club", "Design Collective", "Robotics", "Literary Society"], status: "closed", opens: -9, closes: -2, votes: [0, 0, 0, 1, 1, 2, 0, 3, 2, 0] },
  ];
  const userList = demoUsers.map((u) => users[u.handle].id);
  for (const p of polls) {
    let poll = await db.poll.findFirst({ where: { question: p.question } });
    if (!poll) {
      poll = await db.poll.create({
        data: {
          question: p.question,
          options: p.options,
          status: p.status,
          opensAt: at(p.opens, 8),
          closesAt: at(p.closes, 22),
          createdBy: systemId,
        },
      });
    }
    for (const [i, userId] of userList.entries()) {
      const optionIndex = p.votes[i] ?? 0;
      await db.pollVote.upsert({
        where: { pollId_userId: { pollId: poll.id, userId } },
        update: {},
        create: { pollId: poll.id, userId, optionIndex },
      });
    }
  }
  console.log(`✓ ${polls.length} polls + votes`);

  // ── Lost & Found ─────────────────────────────────────────
  const lostFound = [
    { name: "Black Casio wristwatch", type: "lost", desc: "Lost near the basketball court after evening practice. Has a scratched strap and a small engraving on the back.", location: "Basketball Court", contact: "@arjun on chat", status: "open", days: -1, by: "arjun" },
    { name: "Blue water bottle (1L)", type: "found", desc: "Found in Lecture Hall 3 after the DBMS class. Kept at the security desk.", location: "Lecture Hall 3", contact: "Security desk, Block A", status: "open", days: -2, by: "isha" },
    { name: "Dell laptop charger", type: "found", desc: "65W USB-C charger left in the library reading room. Describe the cable to claim it.", location: "Library, 2nd floor", contact: "DM @naina", status: "resolved", days: -6, by: "naina" },
    { name: "Student ID card — Kabir S.", type: "found", desc: "Found outside the cafeteria. Name is visible, handing it to the admin office today.", location: "Cafeteria entrance", contact: "Admin office", status: "open", days: 0, by: "vikram" },
  ];
  for (const item of lostFound) {
    const exists = await db.lostAndFound.findFirst({ where: { itemName: item.name } });
    if (!exists) {
      await db.lostAndFound.create({
        data: {
          itemName: item.name,
          description: item.desc,
          type: item.type,
          location: item.location,
          occurredOn: at(item.days),
          contactInfo: item.contact,
          status: item.status,
          userId: users[item.by].id,
          resolvedAt: item.status === "resolved" ? at(item.days + 2) : null,
        },
      });
    }
  }
  console.log(`✓ ${lostFound.length} lost & found posts`);

  // ── Anonymous feedback ────────────────────────────────────
  const feedback = [
    { category: "Facilities", message: "The water coolers on the second floor have been out of order for a week. Could maintenance take a look?", status: "open", year: 2, branch: "CSE" },
    { category: "Academic", message: "It would help if assignment deadlines were published at the start of the semester instead of week by week.", status: "in_review", year: 3, branch: "IT" },
    { category: "Hostel", message: "Night mess timings overlap with evening labs. A later window would make a real difference.", status: "resolved", year: 1, branch: "ECE" },
    { category: "Clubs", message: "More beginner-friendly workshops, please — most club sessions assume prior experience.", status: "open", year: 2, branch: "ME" },
  ];
  for (const f of feedback) {
    const exists = await db.feedback.findFirst({ where: { message: f.message } });
    if (!exists) {
      await db.feedback.create({
        data: { category: f.category, message: f.message, status: f.status, year: f.year, branch: f.branch },
      });
    }
  }
  console.log(`✓ ${feedback.length} anonymous feedback entries`);

  // ── Mentorship ────────────────────────────────────────────
  const mentorship = [
    { student: "isha", senior: "ananya", message: "Hi! I'd love help mapping out a DSA plan for this semester.", status: "accepted" },
    { student: "kabir", senior: "rohan", message: "Could you share how you approached research internships?", status: "pending" },
    { student: "naina", senior: "dev", message: "Would you review my portfolio before the design club applications?", status: "accepted" },
    { student: "vikram", senior: "ananya", message: "Looking for guidance on placement prep while balancing CE labs.", status: "pending" },
  ];
  for (const m of mentorship) {
    const exists = await db.mentorshipRequest.findFirst({
      where: { studentId: users[m.student].id, seniorId: users[m.senior].id },
    });
    if (!exists) {
      await db.mentorshipRequest.create({
        data: {
          studentId: users[m.student].id,
          seniorId: users[m.senior].id,
          message: m.message,
          status: m.status,
          respondedAt: m.status === "accepted" ? new Date() : null,
        },
      });
    }
  }
  console.log(`✓ ${mentorship.length} mentorship requests`);

  // ── Academic calendar ─────────────────────────────────────
  const calendar = [
    { title: "Mid-semester examinations begin", category: "exam", days: 4, allDay: true, location: "Exam halls A–D" },
    { title: "DBMS assignment 2 due", category: "assignment", days: 2, allDay: false, location: null },
    { title: "Founder's Day (holiday)", category: "holiday", days: 8, allDay: true, location: null },
    { title: "Hack Night: Build for Campus", category: "event", days: 3, allDay: false, location: "Innovation Lab" },
    { title: "Placement bootcamp registration closes", category: "deadline", days: 6, allDay: false, location: null },
    { title: "Operating Systems end-sem", category: "exam", days: 12, allDay: false, location: "Hall B" },
    { title: "Project demo day", category: "event", days: 16, allDay: false, location: "Auditorium" },
    { title: "Semester break starts", category: "holiday", days: 21, allDay: true, location: null },
  ];
  for (const c of calendar) {
    const exists = await db.academicCalendar.findFirst({ where: { title: c.title } });
    if (!exists) {
      await db.academicCalendar.create({
        data: {
          title: c.title,
          category: c.category,
          startsAt: at(c.days, 9),
          endsAt: c.allDay ? at(c.days, 18) : null,
          location: c.location,
          isAllDay: c.allDay,
          createdBy: systemId,
        },
      });
    }
  }
  console.log(`✓ ${calendar.length} calendar entries`);

  // ── Study groups ──────────────────────────────────────────
  const groups = [
    { title: "CSE Semester 3 — DSA Circle", subject: "Data Structures", branch: "CSE", year: 2, max: 18, by: "isha", desc: "Weekly problem-solving sessions, Sundays 5pm in the library." },
    { title: "Placement Prep Squad", subject: "Placements", branch: null, year: 4, max: 25, by: "ananya", desc: "Mock interviews, resume reviews, and company-wise question sharing." },
    { title: "ECE Signals Study Jam", subject: "Signals & Systems", branch: "ECE", year: 2, max: 15, by: "rohan", desc: "Working through past papers together before the mid-sem." },
    { title: "Design + Code Studio", subject: "Product Design", branch: null, year: null, max: 20, by: "dev", desc: "Build small products together — designers and developers welcome." },
  ];
  for (const g of groups) {
    const exists = await db.studyGroup.findFirst({ where: { title: g.title } });
    if (!exists) {
      await db.studyGroup.create({
        data: {
          title: g.title,
          description: g.desc,
          subject: g.subject,
          branch: g.branch ?? undefined,
          year: g.year ?? undefined,
          maxMembers: g.max,
          createdBy: users[g.by].id,
        },
      });
    }
  }
  console.log(`✓ ${groups.length} study groups`);

  // ── Campus Q&A ────────────────────────────────────────────
  const questions = [
    { title: "How do I prepare for DSA interviews in 3 months?", body: "I know basic arrays and strings but feel lost with graphs and DP. What order should I follow, and how many problems per day is realistic alongside classes?", category: "Placements", tags: ["DSA", "Interview"], by: "kabir" },
    { title: "Best electives for a product management path?", body: "Planning to apply for APM roles next year. Which electives and projects would strengthen my profile the most?", category: "Academics", tags: ["Placements", "Electives"], by: "isha" },
    { title: "How does the semester exchange program work?", body: "I heard there are partner universities in Europe. What's the eligibility, timeline, and cost? Has anyone here done it?", category: "General", tags: ["Exchange", "Higher studies"], by: "naina" },
    { title: "Laptop recommendations for ML coursework?", body: "My current laptop struggles with anything beyond small datasets. Is 16GB RAM enough, or should I look at a GPU machine?", category: "Tech", tags: ["ML", "Hardware"], by: "vikram" },
  ];
  for (const q of questions) {
    const exists = await db.question.findFirst({ where: { title: q.title } });
    if (!exists) {
      const row = await db.question.create({
        data: { title: q.title, body: q.body, category: q.category, tags: q.tags, authorId: users[q.by].id },
      });
      if (q.title.startsWith("How do I prepare")) {
        await db.answer.create({
          data: {
            questionId: row.id,
            authorId: users.ananya.id,
            isAccepted: true,
            body: "Start with arrays, hashing, and two-pointers for two weeks. Then trees and graphs, then DP. Aim for 3 focused problems a day rather than 10 rushed ones. Use the campus DSA notes folder and bring specific doubts to the study circle on Sundays — happy to walk through them.",
          },
        });
        await db.answer.create({
          data: {
            questionId: row.id,
            authorId: users.dev.id,
            body: "Also do timed mock interviews early, even if you feel unprepared. The feedback loop matters more than finishing a checklist.",
          },
        });
      }
      if (q.title.startsWith("Best electives")) {
        await db.answer.create({
          data: {
            questionId: row.id,
            authorId: users.dev.id,
            body: "Take a consumer behaviour or analytics elective if it's offered, and pair it with one hands-on product project. APM interviews care a lot about how you frame trade-offs, not just coursework.",
          },
        });
      }
    }
  }
  console.log(`✓ ${questions.length} Q&A threads`);

  // ── Placements ────────────────────────────────────────────
  const placements = [
    { title: "Software Engineer Intern — Summer 2027", company: "Google", category: "internship", url: "https://careers.google.com/students/", tags: ["SDE", "DSA", "Internship"], desc: "Applications open for second and third-year students. Expect two coding rounds and one behavioural." },
    { title: "Product Analyst Graduate Program", company: "Zomato", category: "full-time", url: "https://www.zomato.com/careers", tags: ["Product", "Analytics"], desc: "Campus hire track for final years. SQL and case-study heavy interview loop." },
    { title: "Resume Review Checklist", company: "VibeZone Placements", category: "resource", url: "https://drive.google.com/drive/folders/1AaSsDdFfGgHhJjKkLlZzXxCc", tags: ["Resume", "Preparation"], desc: "The exact checklist seniors use before submitting applications — one page, action words, metrics." },
    { title: "Consulting Case Interview Workshop", company: "Deloitte", category: "event", url: "https://www.deloitte.com/careers", tags: ["Consulting", "Workshop"], desc: "Live case walkthrough with recruiters. Third and fourth years, register via the placement cell." },
    { title: "Backend Developer — Fintech", company: "Razorpay", category: "full-time", url: "https://razorpay.com/jobs/", tags: ["Backend", "Node", "SQL"], desc: "Looking for strong fundamentals in databases and APIs. Referral available through the alumni network." },
    { title: "Aptitude & GATE Prep Drive", company: "Campus Placement Cell", category: "resource", url: "https://drive.google.com/drive/folders/1QqWwEeRrTtYyUuIiOoPpAaSs", tags: ["GATE", "Aptitude"], desc: "Shared question bank and weekly mock schedule for the upcoming placement season." },
  ];
  for (const p of placements) {
    const exists = await db.placementResource.findFirst({ where: { title: p.title } });
    if (!exists) {
      await db.placementResource.create({
        data: {
          title: p.title,
          company: p.company,
          description: p.desc,
          category: p.category,
          url: p.url,
          tags: p.tags,
          createdBy: systemId,
        },
      });
    }
  }
  console.log(`✓ ${placements.length} placement resources`);

  // ── Broadcasts ────────────────────────────────────────────
  const broadcasts = [
    { title: "Hack Night opening keynote", desc: "Live from the Innovation Lab — problem statements, rules, and mentor intros.", status: "live", start: 0, viewer: 148, url: "https://www.youtube.com/watch?v=jfKfPfyJRdk", thumb: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80" },
    { title: "Placement AMA with recent graduates", desc: "Ask anything about interviews, offers, and the first 90 days at work.", status: "upcoming", start: 2, viewer: 0, url: "https://www.youtube.com/watch?v=21X5lGlDOfg", thumb: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80" },
    { title: "Cultural night — live showcase", desc: "Music, dance, and spoken word from the annual cultural showcase.", status: "upcoming", start: 5, viewer: 0, url: "https://www.youtube.com/watch?v=jfKfPfyJRdk", thumb: "https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&w=1200&q=80" },
    { title: "Freshers' orientation replay", desc: "Missed the welcome session? Watch the full recording.", status: "ended", start: -18, viewer: 0, url: "https://www.youtube.com/watch?v=21X5lGlDOfg", thumb: null },
    { title: "Inter-branch football finals", desc: "Full match replay from the campus ground.", status: "ended", start: -9, viewer: 0, url: "https://www.youtube.com/watch?v=jfKfPfyJRdk", thumb: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80" },
  ];
  for (const b of broadcasts) {
    const exists = await db.broadcast.findFirst({ where: { title: b.title } });
    if (!exists) {
      await db.broadcast.create({
        data: {
          title: b.title,
          description: b.desc,
          streamUrl: b.url,
          thumbnailUrl: b.thumb ?? undefined,
          status: b.status,
          startsAt: at(b.start, b.status === "live" ? new Date().getHours() : 19),
          endsAt: b.status === "ended" ? at(b.start, 21) : null,
          viewerCount: b.viewer,
          hostedBy: users.meera.id,
        },
      });
    }
  }
  console.log(`✓ ${broadcasts.length} broadcasts`);

  // ── Social feed ───────────────────────────────────────────
  const posts = [
    { by: "meera", body: "Hack Night is officially on! Teams of 2–4, overnight at the Innovation Lab this Friday. No experience needed — we'll have mentors and a beginner track. Drop a comment if you're looking for teammates. 🚀", tags: ["hacknight", "coding"], image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80" },
    { by: "ananya", body: "Placement prep bootcamp registrations close this weekend. If you're in your final year and haven't signed up, this is your reminder. Resume reviews happen on day one — bring a printed copy.", tags: ["placements"], image: null },
    { by: "vikram", body: "Golden hour on the main ground today. Sometimes this campus is unreasonably pretty.", tags: ["photography", "campus"], image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80" },
    { by: "naina", body: "Shared my ML workshop notes in the study circle folder. We covered regression, a bit of classification, and how to actually debug a model that refuses to learn. Questions welcome.", tags: ["ml", "notes"], image: null },
    { by: "kabir", body: "First-year tip: the library's second floor is silent until about 4pm, then it turns into a group-project war zone. Plan accordingly.", tags: ["tips"], image: null },
    { by: "dev", body: "Looking for two people to build a small campus marketplace over the break — one frontend, one backend. Portfolio-worthy, low pressure, real users. DM me if interested.", tags: ["startup", "projects"], image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80" },
  ];
  for (const p of posts) {
    const exists = await db.post.findFirst({ where: { body: p.body } });
    if (!exists) {
      const post = await db.post.create({
        data: {
          authorId: users[p.by].id,
          body: p.body,
          imageUrl: p.image ?? undefined,
          tags: p.tags,
          visibility: "campus",
        },
      });
      for (const handle of ["isha", "kabir", "arjun", "naina"]) {
        if (handle === p.by) continue;
        await db.postLike.upsert({
          where: { postId_userId: { postId: post.id, userId: users[handle].id } },
          update: {},
          create: { postId: post.id, userId: users[handle].id },
        });
      }
      await db.postComment.create({
        data: {
          postId: post.id,
          authorId: users.isha.id,
          body: p.by === "meera" ? "Count me in — I'll bring two teammates from my batch!" : "This is genuinely useful, thanks for sharing.",
        },
      });
      await db.postBookmark.upsert({
        where: { postId_userId: { postId: post.id, userId: users.naina.id } },
        update: {},
        create: { postId: post.id, userId: users.naina.id },
      });
    }
  }
  console.log(`✓ ${posts.length} feed posts + engagement`);

  // ── Chat messages ─────────────────────────────────────────
  const general = await db.channel.findUnique({ where: { slug: "general" } });
  if (general) {
    const chatter = [
      { by: "meera", body: "Hack Night sign-ups are live — link is pinned in the announcements board." },
      { by: "kabir", body: "Anyone else's Wi-Fi dropping in Block B or is it just me?" },
      { by: "isha", body: "Same here since morning. IT said they're replacing an access point today." },
      { by: "vikram", body: "Cafeteria has fresh samosas. That is all." },
      { by: "naina", body: "Reminder: ML workshop moved to Seminar Hall 2, same time." },
    ];
    for (const m of chatter) {
      const exists = await db.message.findFirst({ where: { channelId: general.id, body: m.body } });
      if (!exists) {
        await db.message.create({
          data: { channelId: general.id, senderId: users[m.by].id, body: m.body },
        });
      }
    }
  }

  // ── Points / leaderboard ──────────────────────────────────
  const pointPlan: Record<string, number> = {
    ananya: 420, meera: 385, dev: 350, naina: 310, isha: 280,
    rohan: 245, arjun: 210, kabir: 180, vikram: 150, zoya: 120,
  };
  for (const [handle, points] of Object.entries(pointPlan)) {
    const exists = await db.pointLedger.findFirst({
      where: { userId: users[handle].id, action: "seed_bonus" },
    });
    if (!exists) {
      await db.pointLedger.create({
        data: {
          userId: users[handle].id,
          action: "seed_bonus",
          points,
          refType: "seed",
          refId: null,
          bucketDate: new Date(),
        },
      });
    }
  }
  console.log("✓ leaderboard points");

  // ── Notifications ─────────────────────────────────────────
  const notifications = [
    { type: "event_reminder", title: "Hack Night starts in 2 days", body: "Innovation Lab, 6pm. Bring your laptop.", link: "/events" },
    { type: "poll_open", title: "New poll: where should the next trip go?", body: "Vote before Friday.", link: "/polls" },
    { type: "mentorship", title: "Ananya accepted your mentorship request", body: "Say hi and set a first goal.", link: "/mentorship" },
  ];
  for (const handle of ["isha", "kabir", "naina"]) {
    for (const [i, n] of notifications.entries()) {
      const exists = await db.notification.findFirst({ where: { userId: users[handle].id, title: n.title } });
      if (!exists) {
        await db.notification.create({
          data: {
            userId: users[handle].id,
            type: n.type,
            title: n.title,
            body: n.body,
            link: n.link,
            readAt: i === 2 ? new Date() : null,
          },
        });
      }
    }
  }
  console.log("✓ notifications");
}

async function seedQuiz() {
  const existing = await db.quiz.findFirst({ where: { title: "Campus & Code — Weekly Quiz" } });
  if (existing) return;

  const monday = new Date();
  const day = monday.getDay();
  monday.setDate(monday.getDate() - ((day + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  await db.quiz.create({
    data: {
      title: "Campus & Code — Weekly Quiz",
      weekOf: monday,
      opensAt: at(-1, 7),
      closesAt: at(7, 23),
      questions: [
        {
          q: "Which data structure works on a first-in, first-out (FIFO) basis?",
          options: ["Stack", "Queue", "Binary tree", "Hash map"],
          answer: 1,
          explain: "A queue removes items in the same order they were added.",
        },
        {
          q: "What does an HTTP 404 response mean?",
          options: ["Server error", "Unauthorized", "Not found", "Redirect"],
          answer: 2,
          explain: "404 means the server could not find the requested resource.",
        },
        {
          q: "Which company originally created React?",
          options: ["Google", "Meta", "Microsoft", "Vercel"],
          answer: 1,
          explain: "React was open-sourced by Meta (then Facebook) in 2013.",
        },
        {
          q: "What is the time complexity of binary search on a sorted array?",
          options: ["O(n)", "O(n log n)", "O(log n)", "O(1)"],
          answer: 2,
          explain: "Each comparison halves the search space, giving logarithmic time.",
        },
        {
          q: "Which block hosts the campus Innovation Lab?",
          options: ["Block A", "Block B", "Block C", "Block D"],
          answer: 2,
          explain: "Hack nights and the maker space live in Block C.",
        },
      ],
    },
  });
  console.log("✓ weekly quiz");
}

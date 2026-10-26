/**
 * VibeZone scheduler (PRD §9.1 / NFR-011) — node-cron in Asia/Kolkata.
 * Runs on the OCI VM against the Neon database (D12).
 *
 * Jobs: announcement notify fan-out, poll open/close, event reminders
 * (T-24h / T-1h), retention cleanups, mentorship expiry.
 * Time-critical scheduling never runs on Vercel Hobby.
 */
const cron = require("node-cron");
const { Pool } = require("pg");

const DATABASE_URL = process.env.DATABASE_URL || "";
const APP_URL = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
const MAILER_URL = process.env.MAILER_URL || "";
const MAILER_SECRET = process.env.MAILER_SECRET || "";
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:vibezoneioi25@gmail.com";

if (!DATABASE_URL) {
  console.error("[scheduler] DATABASE_URL is required");
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
  max: 4,
});

let webpush = null;
if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush = require("web-push");
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}

function log(...args) {
  console.log(new Date().toISOString(), ...args);
}

async function sendPush(userIds, payload) {
  if (!webpush || userIds.length === 0) return;
  const { rows } = await pool.query(
    `select endpoint, p256dh, auth from push_subscriptions where user_id = any($1::uuid[])`,
    [userIds],
  );
  await Promise.allSettled(
    rows.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload),
        );
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await pool.query("delete from push_subscriptions where endpoint = $1", [s.endpoint]);
        } else {
          log("[push] failed", err.statusCode || err.message);
        }
      }
    }),
  );
}

async function sendEmail(userIds, subject, text) {
  if (!MAILER_URL || userIds.length === 0) return;
  const { rows } = await pool.query(
    `select u.email from users u
      where u.id = any($1::uuid[]) and u.status = 'active'
        and exists (
          select 1 from notification_prefs p
           where p.user_id = u.id and p.category = 'event_reminder' and p.email_enabled = true
        )`,
    [userIds],
  );
  for (const row of rows) {
    try {
      await fetch(MAILER_URL, {
        method: "POST",
        headers: { "content-type": "application/json", "x-mailer-secret": MAILER_SECRET },
        body: JSON.stringify({ to: row.email, subject, text }),
      });
    } catch (err) {
      log("[email] failed", row.email, err.message);
    }
  }
}

/**
 * In-app notification + push for a set of users, respecting per-category prefs.
 * Returns the users that received an in-app row.
 */
async function notifyUsers(userIds, category, title, body, link, opts = {}) {
  const ids = [...new Set(userIds)].filter(Boolean);
  if (ids.length === 0) return [];

  const { rows: prefs } = await pool.query(
    `select user_id, inapp_enabled, push_enabled from notification_prefs
      where category = $1 and user_id = any($2::uuid[])`,
    [category, ids],
  );
  const pref = new Map(prefs.map((p) => [p.user_id, p]));
  const inapp = ids.filter((id) => pref.get(id)?.inapp_enabled !== false);
  const push = ids.filter((id) => pref.get(id)?.push_enabled !== false);

  if (inapp.length > 0) {
    await pool.query(
      `insert into notifications (user_id, type, title, body, link)
       select unnest($1::uuid[]), $2, $3, $4, $5`,
      [inapp, category, title, body, link],
    );
  }
  await sendPush(push, { title, body, url: `${APP_URL}${link}` });
  if (opts.email) await sendEmail(push, opts.email.subject, opts.email.text);
  return inapp;
}

async function activeUserIds() {
  const { rows } = await pool.query("select id from users where status = 'active'");
  return rows.map((r) => r.id);
}

// ---------------------------------------------------------------- jobs

async function publishAnnouncements() {
  const { rows } = await pool.query(
    `select id, title, body from announcements
      where notify = true and notified_at is null and archived_at is null and publish_at <= now()`,
  );
  for (const a of rows) {
    const users = await activeUserIds();
    await notifyUsers(
      users,
      "announcement",
      a.title,
      String(a.body || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160),
      `/announcements/${a.id}`,
    );
    await pool.query("update announcements set notified_at = now() where id = $1", [a.id]);
    log(`[announcement] notified ${users.length} users: ${a.title}`);
  }
}

async function rollPolls() {
  const opened = await pool.query(
    `update polls set status = 'open'
      where status = 'scheduled' and opens_at <= now() and (closes_at is null or closes_at > now())
      returning id, question`,
  );
  for (const p of opened.rows) {
    const users = await activeUserIds();
    await notifyUsers(users, "poll_open", "Today's poll is live", p.question, "/polls");
    log(`[poll] opened ${p.id}`);
  }
  const closed = await pool.query(
    `update polls set status = 'closed' where status = 'open' and closes_at is not null and closes_at <= now()
      returning id`,
  );
  if (closed.rowCount) log(`[poll] closed ${closed.rowCount}`);
}

async function eventReminders() {
  // T-24h
  const day = await pool.query(
    `select e.id, e.title, e.starts_at, e.location
       from events e
      where e.status = 'published' and e.starts_at > now() and e.starts_at <= now() + interval '24 hours'`,
  );
  for (const e of day.rows) {
    const { rows } = await pool.query(
      `select user_id from event_rsvps
        where event_id = $1 and status = 'going' and reminded_24_at is null`,
      [e.id],
    );
    const ids = rows.map((r) => r.user_id);
    if (ids.length === 0) continue;
    const when = new Date(e.starts_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    await notifyUsers(ids, "event_reminder", `Tomorrow: ${e.title}`, `${when} IST${e.location ? ` · ${e.location}` : ""}`, `/events/${e.id}`, {
      email: { subject: `Tomorrow: ${e.title}`, text: `${e.title}\n${when} IST\n${APP_URL}/events/${e.id}` },
    });
    await pool.query(
      `update event_rsvps set reminded_24_at = now() where event_id = $1 and user_id = any($2::uuid[])`,
      [e.id, ids],
    );
    log(`[event] T-24h reminder ${e.title} → ${ids.length}`);
  }

  // T-1h
  const hour = await pool.query(
    `select e.id, e.title, e.starts_at, e.location
       from events e
      where e.status = 'published' and e.starts_at > now() and e.starts_at <= now() + interval '1 hour'`,
  );
  for (const e of hour.rows) {
    const { rows } = await pool.query(
      `select user_id from event_rsvps
        where event_id = $1 and status = 'going' and reminded_1_at is null`,
      [e.id],
    );
    const ids = rows.map((r) => r.user_id);
    if (ids.length === 0) continue;
    const when = new Date(e.starts_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    await notifyUsers(ids, "event_reminder", `Starting soon: ${e.title}`, `${when} IST${e.location ? ` · ${e.location}` : ""}`, `/events/${e.id}`, {
      email: { subject: `Starting soon: ${e.title}`, text: `${e.title}\n${when} IST\n${APP_URL}/events/${e.id}` },
    });
    await pool.query(
      `update event_rsvps set reminded_1_at = now() where event_id = $1 and user_id = any($2::uuid[])`,
      [e.id, ids],
    );
    log(`[event] T-1h reminder ${e.title} → ${ids.length}`);
  }
}

async function cleanups() {
  const feedback = await pool.query(
    "update feedback set ip_hash = null where ip_hash is not null and created_at < now() - interval '7 days'",
  );
  const notifs = await pool.query("delete from notifications where created_at < now() - interval '90 days'");
  const msgs = await pool.query(
    "delete from messages where deleted_at is not null and deleted_at < now() - interval '30 days'",
  );
  const otps = await pool.query("delete from email_otps where created_at < now() - interval '15 minutes'");
  const mentors = await pool.query(
    `update mentorship_requests set status = 'expired'
      where status = 'pending' and created_at < now() - interval '14 days'`,
  );
  log(
    `[cleanup] feedback ${feedback.rowCount}, notifs ${notifs.rowCount}, msgs ${msgs.rowCount}, otps ${otps.rowCount}, mentors ${mentors.rowCount}`,
  );
}

let running = false;
async function tick() {
  if (running) return;
  running = true;
  try {
    await publishAnnouncements();
    await rollPolls();
    await eventReminders();
    await cleanups();
  } catch (err) {
    log("[job] error", err.message);
  } finally {
    running = false;
  }
}

cron.schedule("* * * * *", tick, { timezone: "Asia/Kolkata" });
log(`[scheduler] started · app=${APP_URL} · IST cron every minute`);
tick();

process.on("SIGTERM", async () => {
  await pool.end().catch(() => {});
  process.exit(0);
});

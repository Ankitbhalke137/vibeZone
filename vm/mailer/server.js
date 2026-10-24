/**
 * VibeZone mailer — minimal HTTP endpoint that sends mail via Gmail SMTP :587 (D8).
 * Public only through Caddy (TLS) and requires header `x-mailer-secret`.
 * Deps: express-free on purpose — node:http + nodemailer.
 */
const http = require("node:http");
const nodemailer = require("nodemailer");

const PORT = 3001;
const SECRET = process.env.MAILER_SECRET || "";
const USER = process.env.SMTP_USER || "";
const PASS = process.env.SMTP_APP_PASSWORD || "";

if (!SECRET || !USER || !PASS) {
  console.error("[mailer] MAILER_SECRET / SMTP_USER / SMTP_APP_PASSWORD are required");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: { user: USER, pass: PASS },
  pool: true,
  maxConnections: 3,
});

// tiny per-IP throttle: 30 sends / hour
const buckets = new Map();
function allowed(ip) {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || b.reset < now) {
    buckets.set(ip, { n: 1, reset: now + 3_600_000 });
    return true;
  }
  b.n += 1;
  return b.n <= 30;
}

function json(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, { "content-type": "application/json", "content-length": Buffer.byteLength(body) });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");

  if (req.method === "GET" && url.pathname === "/health") {
    try {
      await transporter.verify();
      return json(res, 200, { ok: true });
    } catch (e) {
      return json(res, 502, { ok: false, error: String(e.message || e) });
    }
  }

  if (req.method === "POST" && url.pathname === "/send") {
    if (req.headers["x-mailer-secret"] !== SECRET) return json(res, 401, { error: "bad secret" });

    const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "?").toString();
    if (!allowed(ip)) return json(res, 429, { error: "rate limited" });

    let raw = "";
    for await (const chunk of req) {
      raw += chunk;
      if (raw.length > 64_000) return json(res, 413, { error: "too large" });
    }

    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return json(res, 400, { error: "invalid json" });
    }

    const { to, subject, text } = body || {};
    if (typeof to !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
      return json(res, 400, { error: "invalid to" });
    }
    if (typeof subject !== "string" || subject.length > 200) return json(res, 400, { error: "invalid subject" });
    if (typeof text !== "string" || text.length > 5_000) return json(res, 400, { error: "invalid text" });

    try {
      await transporter.sendMail({ from: `VibeZone <${USER}>`, to, subject, text });
      console.log(`[mailer] sent to ${to} (${text.length}B)`);
      return json(res, 202, { ok: true });
    } catch (e) {
      console.error("[mailer] send failed:", e.message || e);
      return json(res, 502, { error: "send failed" });
    }
  }

  return json(res, 404, { error: "not found" });
});

server.listen(PORT, () => console.log(`[mailer] listening on :${PORT} (smtp ${USER})`));

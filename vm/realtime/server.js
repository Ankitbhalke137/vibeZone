/**
 * VibeZone realtime gateway (FR-CHAT-002) — Socket.IO + WSS on the OCI VM.
 *
 * The database lives on Neon; this service only verifies the short-lived
 * realtime JWT minted by the Next.js app, checks channel membership, and fans
 * out events published by the app's REST routes. It never accepts writes from
 * browsers — all validation/scoring stays in the app.
 */
const http = require("node:http");
const { Server } = require("socket.io");
const { jwtVerify } = require("jose");
const { Pool } = require("pg");

const PORT = Number(process.env.PORT || 3002);
const SECRET = process.env.SESSION_SECRET || "";
const PUBLISH_SECRET = process.env.REALTIME_SECRET || "";
const DATABASE_URL = process.env.DATABASE_URL || "";
const ORIGINS = (process.env.APP_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

if (!SECRET || !PUBLISH_SECRET || !DATABASE_URL) {
  console.error("[realtime] SESSION_SECRET, REALTIME_SECRET and DATABASE_URL are required");
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
  max: 5,
});

const key = new TextEncoder().encode(SECRET);

async function authenticate(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key, { audience: "vibezone-realtime" });
    if (!payload.sub) return null;
    const { rows } = await pool.query(
      "select id, status, session_version from users where id = $1",
      [payload.sub],
    );
    const user = rows[0];
    if (!user || user.status !== "active") return null;
    if (Number(payload.sv ?? 0) !== user.session_version) return null;
    return { id: user.id };
  } catch {
    return null;
  }
}

async function canJoin(userId, channelId) {
  const { rows } = await pool.query(
    `select c.id, c.type, c.archived_at,
            exists(select 1 from channel_members m where m.channel_id = c.id and m.user_id = $2) as member
       from channels c where c.id = $1`,
    [channelId, userId],
  );
  const channel = rows[0];
  if (!channel || channel.archived_at) return false;
  if (channel.type === "global") {
    if (!channel.member) {
      await pool.query(
        "insert into channel_members (channel_id, user_id) values ($1,$2) on conflict do nothing",
        [channelId, userId],
      );
    }
    return true;
  }
  return channel.member === true;
}

function json(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(body),
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");

  if (req.method === "GET" && url.pathname === "/health") {
    try {
      await pool.query("select 1");
      return json(res, 200, { ok: true });
    } catch (err) {
      return json(res, 502, { ok: false, error: String(err.message || err) });
    }
  }

  if (req.method === "POST" && url.pathname === "/publish") {
    if (req.headers["x-realtime-secret"] !== PUBLISH_SECRET) {
      return json(res, 401, { error: "bad secret" });
    }
    let raw = "";
    for await (const chunk of req) {
      raw += chunk;
      if (raw.length > 256_000) return json(res, 413, { error: "too large" });
    }
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return json(res, 400, { error: "invalid json" });
    }
    if (!body || typeof body.room !== "string" || typeof body.event !== "string") {
      return json(res, 400, { error: "room and event required" });
    }
    io.to(body.room).emit(body.event, body.payload ?? {});
    return json(res, 202, { ok: true });
  }

  return json(res, 404, { error: "not found" });
});

const io = new Server(server, {
  path: "/socket.io",
  transports: ["websocket"],
  cors: { origin: ORIGINS.length > 0 ? ORIGINS : true, credentials: false },
});

io.use(async (socket, next) => {
  const user = await authenticate(socket.handshake.auth?.token);
  if (!user) return next(new Error("unauthorized"));
  socket.data.userId = user.id;
  next();
});

io.on("connection", (socket) => {
  socket.on("join", async ({ channelId } = {}) => {
    if (typeof channelId !== "string") return;
    const ok = await canJoin(socket.data.userId, channelId).catch(() => false);
    if (!ok) {
      socket.emit("error", { code: "forbidden", message: "Not a member of this channel." });
      return;
    }
    socket.join(`channel:${channelId}`);
  });

  socket.on("leave", ({ channelId } = {}) => {
    if (typeof channelId === "string") socket.leave(`channel:${channelId}`);
  });
});

server.listen(PORT, () => console.log(`[realtime] listening on :${PORT}`));

process.on("SIGTERM", async () => {
  await pool.end().catch(() => {});
  server.close(() => process.exit(0));
});

import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createHash } from "node:crypto";
import { clientIp } from "@/lib/utils";
import { hit } from "@/lib/rate-limit";
import { apiError, assertSameOrigin, parseJson } from "@/lib/api";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  category: z.enum(["Academic", "Facilities", "Hostel", "Clubs", "Other"]),
  message: z.string().trim().min(10).max(1000),
  year: z.number().int().min(1).max(4).optional(),
  branch: z.string().trim().max(50).optional(),
  website: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);

    const raw = await req.json().catch(() => null);
    if (raw?.website && String(raw.website).trim().length > 0) {
      return NextResponse.json({ ok: true });
    }

    const d = Body.safeParse(raw);
    if (!d.success) {
      return NextResponse.json({ error: d.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
    }
    const data = d.data;

    const ip = clientIp(req.headers);
    const ipHash = createHash("sha256").update(`${ip}:${env.feedbackSalt}`).digest("hex");

    const yesterday = new Date(Date.now() - 24 * 60 * 60_000);
    const recent = await db.feedback.findFirst({ where: { ipHash, createdAt: { gte: yesterday } } });
    if (recent) {
      return NextResponse.json({ error: "One feedback submission per day." }, { status: 429 });
    }

    if (!hit(`feedback:${ipHash}`, 1, 86_400_000)) {
      return NextResponse.json({ error: "Rate limited — try again later." }, { status: 429 });
    }

    await db.feedback.create({
      data: { category: data.category, message: data.message, year: data.year ?? null, branch: data.branch ?? null, ipHash },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}

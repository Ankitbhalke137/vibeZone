import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin, parseJson } from "@/lib/api";
import { awardPoints } from "@/lib/points";
import { notifyUsers } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CreateBody = z.object({
  seniorId: z.string(),
  message: z.string().trim().max(600).optional(),
});

export async function GET(req: Request) {
  try {
    const me = await requireUser();
    const url = new URL(req.url);
    const tag = url.searchParams.get("tag");

    const seniors = await db.user.findMany({
      where: {
        status: "active",
        role: "senior",
      },
      select: { id: true, name: true, handle: true, branch: true, year: true, expertise: true, avatarUrl: true },
      take: 50,
    });

    let filtered = seniors;
    if (tag) {
      filtered = seniors.filter((s) => {
        const exp = Array.isArray(s.expertise) ? (s.expertise as unknown[]) : [];
        return exp.some((e) => typeof e === "string" && e.toLowerCase().includes(tag.toLowerCase()));
      });
    }

    const myRequests = await db.mentorshipRequest.findMany({
      where: { studentId: me.id },
      select: { seniorId: true, status: true },
    });
    const requestMap = new Map(myRequests.map((r) => [r.seniorId, r.status]));

    return NextResponse.json({
      seniors: filtered.map((s) => ({
        ...s,
        requestStatus: requestMap.get(s.id) ?? null,
      })),
    });
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const me = await requireUser();
    const d = await parseJson(req, CreateBody);

    if (d.seniorId === me.id) {
      return NextResponse.json({ error: "You can't request yourself." }, { status: 400 });
    }

    const senior = await db.user.findUnique({ where: { id: d.seniorId } });
    if (!senior || senior.role !== "senior" || senior.status !== "active") {
      return NextResponse.json({ error: "Senior not found." }, { status: 404 });
    }

    const openCount = await db.mentorshipRequest.count({
      where: { studentId: me.id, status: "pending" },
    });
    if (openCount >= 5) {
      return NextResponse.json({ error: "Max 5 open requests." }, { status: 409 });
    }

    const existing = await db.mentorshipRequest.findFirst({
      where: { studentId: me.id, seniorId: d.seniorId, status: "pending" },
    });
    if (existing) {
      return NextResponse.json({ error: "Request already pending." }, { status: 409 });
    }

    const mentorshipReq = await db.mentorshipRequest.create({
      data: { studentId: me.id, seniorId: d.seniorId, message: d.message ?? null },
    });

    await notifyUsers([d.seniorId], {
      type: "mentorship",
      title: "New mentorship request",
      body: `@${me.handle} would like to connect with you.`,
      link: "/mentorship",
    });

    return NextResponse.json({ request: { id: mentorshipReq.id } }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}

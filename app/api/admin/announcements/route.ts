import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { HttpError, requireUser } from "@/lib/auth";
import { sanitizeBody, stripTags } from "@/lib/sanitize";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  title: z.string().trim().min(3).max(160),
  body: z.string().trim().min(1).max(20_000),
  category: z.enum(["Academic", "Events", "Placements", "Hostel", "Clubs", "Urgent"]),
  pinned: z.boolean().optional().default(false),
  notify: z.boolean().optional().default(false),
  imageUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || /^https:\/\//.test(v), "Image must be https")
    .optional()
    .default(""),
  publishAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

/** POST /api/admin/announcements — FR-ANN-001 (moderator/admin only). */
export async function POST(req: Request) {
  try {
    const me = await requireUser("moderator");
    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 },
      );
    }
    const d = parsed.data;
    const cleanBody = sanitizeBody(d.body);
    if (stripTags(cleanBody).length < 3) {
      return NextResponse.json({ error: "Body is empty after sanitizing." }, { status: 400 });
    }

    const ann = await db.announcement.create({
      data: {
        title: d.title,
        body: cleanBody,
        category: d.category,
        pinned: d.pinned,
        notify: d.notify, // fan-out runs in the Week 4 scheduler
        imageUrl: d.imageUrl || null,
        publishAt: d.publishAt ? new Date(d.publishAt) : new Date(),
        expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
        authorId: me.id,
      },
    });

    await audit({
      actorId: me.id,
      action: "announcement_create",
      targetType: "announcement",
      targetId: ann.id,
      metadata: { title: ann.title, category: ann.category, pinned: ann.pinned },
    });

    return NextResponse.json({ announcement: { id: ann.id } }, { status: 201 });
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
}

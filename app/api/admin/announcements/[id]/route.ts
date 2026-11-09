import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { sanitizeBody, stripTags } from "@/lib/sanitize";
import { audit } from "@/lib/audit";
import { apiError } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Patch = z.object({
  title: z.string().trim().min(3).max(160).optional(),
  body: z.string().trim().min(1).max(20_000).optional(),
  category: z.enum(["Academic", "Events", "Placements", "Hostel", "Clubs", "Urgent"]).optional(),
  pinned: z.boolean().optional(),
  notify: z.boolean().optional(),
  publishAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  archived: z.boolean().optional(), // archive = soft removal from the public feed
});

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/admin/announcements/[id] — edit / pin / expire / archive (FR-ANN-001). */
export async function PATCH(req: Request, { params }: Params) {
  try {
    const me = await requireUser("moderator");
    const { id } = await params;

    const existing = await db.announcement.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

    const parsed = Patch.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 },
      );
    }
    const d = parsed.data;

    const data: Record<string, unknown> = {};
    if (d.title !== undefined) data.title = d.title;
    if (d.body !== undefined) {
      const clean = sanitizeBody(d.body);
      if (stripTags(clean).length < 3) {
        return NextResponse.json({ error: "Body is empty after sanitizing." }, { status: 400 });
      }
      data.body = clean;
    }
    if (d.category !== undefined) data.category = d.category;
    if (d.pinned !== undefined) data.pinned = d.pinned;
    if (d.notify !== undefined) data.notify = d.notify;
    if (d.publishAt !== undefined) data.publishAt = new Date(d.publishAt);
    if (d.expiresAt !== undefined) data.expiresAt = d.expiresAt ? new Date(d.expiresAt) : null;
    if (d.archived !== undefined) data.archivedAt = d.archived ? new Date() : null;

    const updated = await db.announcement.update({ where: { id }, data });

    await audit({
      actorId: me.id,
      action: d.archived !== undefined ? "announcement_archive" : "announcement_edit",
      targetType: "announcement",
      targetId: id,
      metadata: { title: updated.title, fields: Object.keys(data) },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}

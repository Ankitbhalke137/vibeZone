import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { HttpError, requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Patch = z.object({
  role: z.enum(["student", "senior", "club_leader", "moderator", "faculty", "admin"]).optional(),
  status: z.enum(["active", "banned"]).optional(),
  reason: z.string().trim().max(200).optional(),
});

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH /api/admin/users/[id] — FR-AUTH-007 (grant/revoke roles, soft-ban).
 * Guards: admin required for role changes (D10 — only the super admin grants
 * moderators); moderator+ for ban/unban. Every change writes an audit row.
 */
export async function PATCH(req: Request, { params }: Params) {
  try {
    const me = await requireUser("moderator");
    const { id } = await params;

    if (id === me.id) {
      return NextResponse.json({ error: "You can't change your own account here." }, { status: 400 });
    }

    const parsed = Patch.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 },
      );
    }
    const { role, status, reason } = parsed.data;
    if (!role && !status) {
      return NextResponse.json({ error: "Nothing to change." }, { status: 400 });
    }

    // Role changes are admin-only (D10); ban/unban is moderator+
    if (role && me.role !== "admin") {
      return NextResponse.json({ error: "Only admins can change roles." }, { status: 403 });
    }

    const target = await db.user.findUnique({ where: { id } });
    if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

    const data: { role?: string; status?: string; sessionVersion?: { increment: number } } = {};
    if (role && role !== target.role) data.role = role;
    if (status && status !== target.status) {
      data.status = status;
      // ban force-logs-out everywhere
      if (status === "banned") data.sessionVersion = { increment: 1 };
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ ok: true, unchanged: true });
    }

    const updated = await db.user.update({ where: { id }, data });

    if (data.role) {
      await audit({
        actorId: me.id,
        action: "role_change",
        targetType: "user",
        targetId: id,
        reason,
        metadata: { from: target.role, to: role, handle: target.handle },
      });
    }
    if (data.status) {
      await audit({
        actorId: me.id,
        action: status === "banned" ? "ban" : "unban",
        targetType: "user",
        targetId: id,
        reason,
        metadata: { handle: target.handle },
      });
    }

    return NextResponse.json({ ok: true, role: updated.role, status: updated.status });
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
}

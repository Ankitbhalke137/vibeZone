import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Patch = z.object({
  role: z.enum(["student", "senior", "moderator", "admin"]).optional(),
  status: z.enum(["active", "banned"]).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser("admin");
    const { id } = await params;

    const parsed = Patch.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { role, status } = parsed.data;
    if (!role && !status) {
      return NextResponse.json({ error: "Nothing to change" }, { status: 400 });
    }

    const target = await db.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data: any = {};
    if (role && role !== target.role) data.role = role;
    if (status && status !== target.status) {
      data.status = status;
      if (status === "banned") data.sessionVersion = { increment: 1 };
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ ok: true, unchanged: true });
    }

    const updated = await db.user.update({ where: { id }, data });

    return NextResponse.json({ ok: true, role: updated.role, status: updated.status });
  } catch (e) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, assertSameOrigin, parseJson } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  endpoint: z.string(),
  p256dh: z.string(),
  auth: z.string(),
});

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const me = await requireUser();
    const d = await parseJson(req, Body);

    await db.pushSubscription.upsert({
      where: { endpoint: d.endpoint },
      update: { p256dh: d.p256dh, auth: d.auth },
      create: { userId: me.id, endpoint: d.endpoint, p256dh: d.p256dh, auth: d.auth },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}

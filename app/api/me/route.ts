import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, HttpError, requireUser } from "@/lib/auth";
import { getSession, slideSession } from "@/lib/session";
import { isValidAvatarUrl } from "@/lib/avatars";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Current user + sliding session refresh (7-day sliding window, FR-AUTH-004). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  const session = await getSession();
  if (session) await slideSession(session);
  return NextResponse.json({ user });
}

const Patch = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  handle: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,20}$/, "3–20 chars: a–z, 0–9, _")
    .optional(),
  bio: z.string().trim().max(300).nullable().optional(),
  branch: z.string().trim().max(50).nullable().optional(),
  year: z.number().int().min(1).max(4).nullable().optional(),
  avatarUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || isValidAvatarUrl(v), "Pick a preset avatar or a valid image URL")
    .optional(),
  completeOnboarding: z.boolean().optional(),
});

/** Profile update / onboarding. */
export async function PATCH(req: Request) {
  try {
    const me = await requireUser();
    const parsed = Patch.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 },
      );
    }
    const { completeOnboarding, ...data } = parsed.data;
    const clean = {
      ...data,
      ...(data.avatarUrl !== undefined
        ? { avatarUrl: data.avatarUrl === "" ? null : data.avatarUrl }
        : {}),
    };

    if (clean.handle && clean.handle !== me.handle) {
      const clash = await db.user.findUnique({ where: { handle: clean.handle } });
      if (clash) return NextResponse.json({ error: "That handle is taken." }, { status: 409 });
    }

    const user = await db.user.update({
      where: { id: me.id },
      data: {
        ...clean,
        ...(completeOnboarding ? { onboardedAt: new Date() } : {}),
      },
    });

    return NextResponse.json({
      user: { id: user.id, handle: user.handle, name: user.name, onboardedAt: user.onboardedAt },
    });
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
}

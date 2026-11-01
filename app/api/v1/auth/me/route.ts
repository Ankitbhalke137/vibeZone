import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        handle: user.handle,
        name: user.name,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        branch: user.branch,
        year: user.year,
        role: user.role,
        onboardedAt: user.onboardedAt,
      },
    });
  } catch (e) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}

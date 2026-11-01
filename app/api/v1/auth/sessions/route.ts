import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ sessions: [] }, { status: 401 });
    }

    // In a real implementation, sessions would be stored in a sessions table
    // For now, return the current session info
    return NextResponse.json({
      sessions: [
        {
          id: "current",
          userId: user.id,
          createdAt: new Date().toISOString(),
          lastSeenAt: new Date().toISOString(),
          isCurrent: true,
        },
      ],
    });
  } catch (e) {
    return NextResponse.json({ sessions: [] }, { status: 500 });
  }
}

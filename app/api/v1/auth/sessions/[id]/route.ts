import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;

    // Can't revoke current session via this endpoint (use logout instead)
    if (id === "current") {
      return NextResponse.json(
        { error: "Use logout endpoint to sign out of current session" },
        { status: 400 },
      );
    }

    // In a real implementation, we'd revoke the specific session
    // For now, just return success
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to revoke session" }, { status: 500 });
  }
}

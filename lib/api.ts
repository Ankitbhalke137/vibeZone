import { NextResponse } from "next/server";
import type { z } from "zod";
import { HttpError } from "@/lib/auth";

/** Uniform API error envelope. Unknown errors are logged, never leaked. */
export function apiError(err: unknown): NextResponse {
  if (err instanceof HttpError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error("[api] unhandled:", err);
  return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
}

/** Reads + validates a JSON body with a shared Zod schema. */
export async function parseJson<T extends z.ZodTypeAny>(
  req: Request,
  schema: T,
): Promise<z.infer<T>> {
  const raw = await req.json().catch(() => null);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message ?? "Invalid input.");
  }
  return parsed.data;
}

/**
 * Basic CSRF defence for JSON mutating routes: browsers always send Origin on
 * cross-site fetches, so reject a mismatched Origin (SameSite=Lax is the second
 * layer). Requests without Origin (curl, server-to-server) are allowed.
 */
export function assertSameOrigin(req: Request): void {
  const origin = req.headers.get("origin");
  if (!origin) return;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    const originHost = new URL(origin).host;
    if (host && originHost !== host) {
      throw new HttpError(403, "Cross-origin request blocked.");
    }
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(403, "Bad origin.");
  }
}

/** Short, safe snippet for moderation context/report bodies. */
export function excerpt(input: string, max = 180): string {
  const flat = input.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

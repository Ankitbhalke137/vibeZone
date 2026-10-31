import "server-only";
import { db } from "@/lib/db";
import { getSession, type Session } from "@/lib/session";

export type SafeUser = {
  id: string;
  email: string;
  handle: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  branch: string | null;
  year: number | null;
  role: string;
  onboardedAt: Date | null;
};

export const ROLE_RANK = {
  student: 0,
  senior: 1,
  club_leader: 2,
  moderator: 3,
  faculty: 4,
  admin: 5,
} as const;
export type Role = keyof typeof ROLE_RANK;

/** Resolves the session → user row (or null). */
export async function getCurrentUser(): Promise<SafeUser | null> {
  const session = (await getSession()) as Session | null;
  if (!session) return null;
  const u = await db.user.findUnique({ where: { id: session.sub } });
  if (!u || u.status !== "active") return null;
  // "Sign out everywhere" (FR-AUTH-004): token sv must match the stored version
  if (session.sv !== u.sessionVersion) return null;
  return {
    id: u.id,
    email: u.email,
    handle: u.handle,
    name: u.name,
    avatarUrl: u.avatarUrl,
    bio: u.bio,
    branch: u.branch,
    year: u.year,
    role: u.role,
    onboardedAt: u.onboardedAt,
  };
}

export function hasRole(user: SafeUser | null, min: Role): boolean {
  if (!user) return false;
  return (ROLE_RANK[user.role as Role] ?? 0) >= ROLE_RANK[min];
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Throws 401/403 unless the caller is signed in at `min` role. */
export async function requireUser(min: Role = "student"): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) throw new HttpError(401, "Sign in required.");
  if (!hasRole(user, min)) throw new HttpError(403, "Not allowed.");
  return user;
}

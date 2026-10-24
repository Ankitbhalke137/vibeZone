import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { env } from "@/lib/env";

export const SESSION_COOKIE = "vz_session";
export const SESSION_DAYS = 7; // FR-AUTH-004

export type Session = { sub: string; role: string };

const key = () => new TextEncoder().encode(env.sessionSecret);

export async function signSession(s: Session): Promise<string> {
  return new SignJWT({ role: s.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(s.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(key());
}

export async function verifySessionToken(token?: string | null): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    if (!payload.sub) return null;
    return { sub: payload.sub, role: String(payload.role ?? "student") };
  } catch {
    return null;
  }
}

/** Sets the session cookie (httpOnly, Secure in prod, SameSite=Lax — FR-AUTH-004). */
export async function setSessionCookie(session: Session) {
  const token = await signSession(session);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

/** Sliding refresh — call on successful /api/me reads. */
export async function slideSession(session: Session) {
  await setSessionCookie(session);
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

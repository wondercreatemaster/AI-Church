"use server";

import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const ANONYMOUS_SESSION_COOKIE = "anonymous_session";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Generate a new anonymous session ID
 */
function generateAnonymousSessionId(): string {
  return `anon_${randomUUID()}`;
}

/**
 * Get existing anonymous session or create a new one
 */
export async function getOrCreateAnonymousSession(): Promise<string> {
  const cookieStore = await cookies();
  const existingSession = cookieStore.get(ANONYMOUS_SESSION_COOKIE);

  if (existingSession?.value) {
    return existingSession.value;
  }

  // Create new session
  const sessionId = generateAnonymousSessionId();
  cookieStore.set(ANONYMOUS_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return sessionId;
}

/**
 * Get existing anonymous session (doesn't create new one)
 */
export async function getAnonymousSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ANONYMOUS_SESSION_COOKIE);
  return session?.value || null;
}

/**
 * Delete anonymous session cookie
 */
export async function deleteAnonymousSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ANONYMOUS_SESSION_COOKIE);
}

/**
 * Check if current user is anonymous (has anonymous session but no auth session)
 */
export async function isAnonymousUser(authSession: any): Promise<boolean> {
  if (authSession?.user?.id) {
    return false;
  }
  const anonSession = await getAnonymousSession();
  return !!anonSession;
}


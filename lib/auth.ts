import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";
import type { Role } from "./constants";

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
}

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: JWTPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Resolve auth from the incoming request.
 * Uses Bearer header (per-tab sessionStorage) — NOT shared cookies.
 * Query `access_token` is supported only for SSE where headers are unavailable.
 */
export async function getAuthFromRequest(
  req: NextRequest
): Promise<JWTPayload | null> {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const payload = await verifyToken(authHeader.slice(7));
    if (payload) return payload;
  }

  const queryToken = req.nextUrl.searchParams.get("access_token");
  if (queryToken) {
    return verifyToken(queryToken);
  }

  return null;
}

export function isAdminOrSupport(role: Role) {
  return role === "admin" || role === "support";
}

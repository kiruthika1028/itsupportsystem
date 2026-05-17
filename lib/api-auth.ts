import { NextRequest } from "next/server";
import { getAuthFromRequest, type JWTPayload } from "./auth";
import { apiError } from "./api-response";
import type { Role } from "./constants";

export async function requireAuth(
  req: NextRequest,
  roles?: Role[]
): Promise<{ user: JWTPayload } | Response> {
  const user = await getAuthFromRequest(req);
  if (!user) return apiError("Unauthorized", 401);
  if (roles && !roles.includes(user.role)) {
    return apiError("Forbidden", 403);
  }
  return { user };
}

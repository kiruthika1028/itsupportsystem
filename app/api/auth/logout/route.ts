import { apiSuccess } from "@/lib/api-response";

/**
 * Logout is handled per-tab via sessionStorage on the client.
 * This endpoint exists for symmetry and future server-side session revocation.
 */
export async function POST() {
  return apiSuccess({ message: "Logged out" });
}

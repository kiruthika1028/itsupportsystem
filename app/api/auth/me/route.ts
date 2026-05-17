import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) return apiError("Unauthorized", 401);

    await connectDB();
    const user = await User.findById(auth.userId);
    if (!user) return apiError("User not found", 404);

    return apiSuccess({ user });
  } catch (err) {
    console.error("Me error:", err);
    return apiError("Failed to fetch user", 500);
  }
}

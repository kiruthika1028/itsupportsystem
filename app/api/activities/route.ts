import { NextRequest } from "next/server";
import ActivityLog from "@/models/ActivityLog";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { isAdminOrSupport } from "@/lib/auth";
import { Types } from "mongoose";

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof Response) return authResult;
  const { user } = authResult;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));

    const filter: Record<string, unknown> = {};
    if (!isAdminOrSupport(user.role)) {
      filter.userId = new Types.ObjectId(user.userId);
    }

    const skip = (page - 1) * limit;
    const [activities, total] = await Promise.all([
      ActivityLog.find(filter)
        .populate("userId", "name email avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ActivityLog.countDocuments(filter),
    ]);

    return apiSuccess({
      activities,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Activities error:", err);
    return apiError("Failed to fetch activities", 500);
  }
}

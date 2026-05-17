import { NextRequest } from "next/server";
import Ticket from "@/models/Ticket";
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

    const baseFilter: Record<string, unknown> = {};
    if (!isAdminOrSupport(user.role)) {
      baseFilter.createdBy = new Types.ObjectId(user.userId);
    }

    const [total, open, inProgress, resolved, closed, recentActivities] =
      await Promise.all([
        Ticket.countDocuments(baseFilter),
        Ticket.countDocuments({ ...baseFilter, status: "open" }),
        Ticket.countDocuments({ ...baseFilter, status: "in_progress" }),
        Ticket.countDocuments({ ...baseFilter, status: "resolved" }),
        Ticket.countDocuments({ ...baseFilter, status: "closed" }),
        ActivityLog.find(
          isAdminOrSupport(user.role)
            ? {}
            : { userId: new Types.ObjectId(user.userId) }
        )
          .populate("userId", "name avatar")
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
      ]);

    const pending = open + inProgress;

    return apiSuccess({
      stats: { total, open, inProgress, resolved, closed, pending },
      recentActivities,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    return apiError("Failed to fetch stats", 500);
  }
}

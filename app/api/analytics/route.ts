import { NextRequest } from "next/server";
import Ticket from "@/models/Ticket";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req, ["admin", "support"]);
  if (authResult instanceof Response) return authResult;

  try {
    await connectDB();

    const [
      statusStats,
      priorityStats,
      categoryStats,
      monthlyTrends,
      departmentStats,
      resolutionStats,
      totalUsers,
      totalTickets,
    ] = await Promise.all([
      Ticket.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Ticket.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]),
      Ticket.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
      Ticket.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
            resolved: {
              $sum: {
                $cond: [{ $in: ["$status", ["resolved", "closed"]] }, 1, 0],
              },
            },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 },
      ]),
      Ticket.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "creator",
          },
        },
        { $unwind: "$creator" },
        {
          $group: {
            _id: "$creator.department",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
      Ticket.aggregate([
        {
          $match: {
            resolvedAt: { $exists: true },
            status: { $in: ["resolved", "closed"] },
          },
        },
        {
          $project: {
            resolutionHours: {
              $divide: [
                { $subtract: ["$resolvedAt", "$createdAt"] },
                1000 * 60 * 60,
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            avgHours: { $avg: "$resolutionHours" },
            count: { $sum: 1 },
          },
        },
      ]),
      User.countDocuments(),
      Ticket.countDocuments(),
    ]);

    const openCount = statusStats.find((s) => s._id === "open")?.count || 0;
    const closedCount =
      (statusStats.find((s) => s._id === "closed")?.count || 0) +
      (statusStats.find((s) => s._id === "resolved")?.count || 0);
    const completionRate =
      totalTickets > 0 ? Math.round((closedCount / totalTickets) * 100) : 0;

    return apiSuccess({
      statusStats,
      priorityStats,
      categoryStats,
      monthlyTrends,
      departmentStats,
      resolutionStats: resolutionStats[0] || { avgHours: 0, count: 0 },
      totalUsers,
      totalTickets,
      openCount,
      completionRate,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    return apiError("Failed to fetch analytics", 500);
  }
}

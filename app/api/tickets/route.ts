import { NextRequest } from "next/server";
import Ticket from "@/models/Ticket";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { ticketCreateSchema } from "@/lib/validators";
import { logActivity } from "@/lib/activity";
import { isAdminOrSupport } from "@/lib/auth";
import { sendTicketEmail } from "@/lib/email";
import { Types } from "mongoose";

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof Response) return authResult;
  const { user } = authResult;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "10"));
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");
    const assignedTo = searchParams.get("assignedTo");

    const filter: Record<string, unknown> = {};

    if (!isAdminOrSupport(user.role)) {
      filter.createdBy = new Types.ObjectId(user.userId);
    }

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = new Types.ObjectId(assignedTo);
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .populate("createdBy", "name email avatar department")
        .populate("assignedTo", "name email avatar")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Ticket.countDocuments(filter),
    ]);

    return apiSuccess({
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Get tickets error:", err);
    return apiError("Failed to fetch tickets", 500);
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof Response) return authResult;
  const { user } = authResult;

  try {
    const body = await req.json();
    const parsed = ticketCreateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message || "Invalid input");
    }

    await connectDB();
    const ticket = await Ticket.create({
      ...parsed.data,
      createdBy: user.userId,
    });

    const populated = await Ticket.findById(ticket._id)
      .populate("createdBy", "name email avatar department")
      .lean();

    await logActivity(user.userId, "created_ticket", "ticket", ticket._id.toString(), {
      title: ticket.title,
    });

    const admins = await User.find({ role: { $in: ["admin", "support"] } }).lean();
    for (const admin of admins) {
      await sendTicketEmail(
        admin.email,
        `New Ticket: ${ticket.title}`,
        `<p>A new support ticket was created by ${user.name}.</p><p><strong>${ticket.title}</strong></p>`
      );
    }

    return apiSuccess({ ticket: populated }, 201);
  } catch (err) {
    console.error("Create ticket error:", err);
    return apiError("Failed to create ticket", 500);
  }
}

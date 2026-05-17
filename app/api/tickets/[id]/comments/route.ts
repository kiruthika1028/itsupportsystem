import { NextRequest } from "next/server";
import Ticket from "@/models/Ticket";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { commentSchema } from "@/lib/validators";
import { logActivity } from "@/lib/activity";
import { isAdminOrSupport } from "@/lib/auth";
import { sendTicketEmail } from "@/lib/email";
import { Types } from "mongoose";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const authResult = await requireAuth(req);
  if (authResult instanceof Response) return authResult;
  const { user } = authResult;
  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message || "Invalid input");
    }

    await connectDB();
    const ticket = await Ticket.findById(id);
    if (!ticket) return apiError("Ticket not found", 404);

    const isOwner = ticket.createdBy.toString() === user.userId;
    if (!isOwner && !isAdminOrSupport(user.role)) {
      return apiError("Forbidden", 403);
    }

    const isInternal = parsed.data.isInternal && isAdminOrSupport(user.role);

    ticket.comments.push({
      userId: new Types.ObjectId(user.userId),
      message: parsed.data.message,
      isInternal: !!isInternal,
      createdAt: new Date(),
    } as never);

    await ticket.save();

    const updated = await Ticket.findById(id)
      .populate("comments.userId", "name email avatar role")
      .lean();

    await logActivity(user.userId, "added_comment", "ticket", id);

    const notifyUser = await User.findById(
      isOwner ? ticket.assignedTo : ticket.createdBy
    );
    if (notifyUser) {
      await sendTicketEmail(
        notifyUser.email,
        `New comment on: ${ticket.title}`,
        `<p>${user.name} added a comment to ticket "${ticket.title}".</p>`
      );
    }

    return apiSuccess({ ticket: updated }, 201);
  } catch (err) {
    console.error("Comment error:", err);
    return apiError("Failed to add comment", 500);
  }
}

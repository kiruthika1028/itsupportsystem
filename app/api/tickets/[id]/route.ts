import { NextRequest } from "next/server";
import Ticket from "@/models/Ticket";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { ticketUpdateSchema } from "@/lib/validators";
import { logActivity } from "@/lib/activity";
import { isAdminOrSupport } from "@/lib/auth";
import { sendTicketEmail } from "@/lib/email";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const authResult = await requireAuth(req);
  if (authResult instanceof Response) return authResult;
  const { user } = authResult;
  const { id } = await params;

  try {
    await connectDB();
    const ticket = await Ticket.findById(id)
      .populate("createdBy", "name email avatar department role")
      .populate("assignedTo", "name email avatar role")
      .populate("comments.userId", "name email avatar role")
      .lean();

    if (!ticket) return apiError("Ticket not found", 404);

    const isOwner = ticket.createdBy?._id?.toString() === user.userId;
    if (!isOwner && !isAdminOrSupport(user.role)) {
      return apiError("Forbidden", 403);
    }

    if (!isAdminOrSupport(user.role)) {
      ticket.comments = ticket.comments.filter((c) => !c.isInternal);
    }

    return apiSuccess({ ticket });
  } catch (err) {
    console.error("Get ticket error:", err);
    return apiError("Failed to fetch ticket", 500);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const authResult = await requireAuth(req);
  if (authResult instanceof Response) return authResult;
  const { user } = authResult;
  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = ticketUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message || "Invalid input");
    }

    await connectDB();
    const ticket = await Ticket.findById(id);
    if (!ticket) return apiError("Ticket not found", 404);

    const isOwner = ticket.createdBy.toString() === user.userId;
    const canManage = isAdminOrSupport(user.role);

    if (!isOwner && !canManage) return apiError("Forbidden", 403);

    const update = { ...parsed.data };

    if (!canManage) {
      delete update.status;
      delete update.assignedTo;
      delete update.internalNotes;
    }

    if (update.status === "resolved" || update.status === "closed") {
      ticket.resolvedAt = new Date();
    }

    Object.assign(ticket, update);
    await ticket.save();

    const populated = await Ticket.findById(id)
      .populate("createdBy", "name email avatar department")
      .populate("assignedTo", "name email avatar")
      .lean();

    await logActivity(user.userId, "updated_ticket", "ticket", id, {
      status: ticket.status,
    });

    const creator = await User.findById(ticket.createdBy);
    if (creator && update.status) {
      await sendTicketEmail(
        creator.email,
        `Ticket Updated: ${ticket.title}`,
        `<p>Your ticket status changed to <strong>${update.status}</strong>.</p>`
      );
    }

    return apiSuccess({ ticket: populated });
  } catch (err) {
    console.error("Update ticket error:", err);
    return apiError("Failed to update ticket", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const authResult = await requireAuth(req, ["admin"]);
  if (authResult instanceof Response) return authResult;
  const { user } = authResult;
  const { id } = await params;

  try {
    await connectDB();
    const ticket = await Ticket.findByIdAndDelete(id);
    if (!ticket) return apiError("Ticket not found", 404);

    await logActivity(user.userId, "deleted_ticket", "ticket", id);
    return apiSuccess({ message: "Ticket deleted" });
  } catch (err) {
    console.error("Delete ticket error:", err);
    return apiError("Failed to delete ticket", 500);
  }
}

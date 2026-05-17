import { NextRequest } from "next/server";
import Ticket from "@/models/Ticket";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { apiError } from "@/lib/api-response";
import { generateTicketsPDF } from "@/lib/pdf-export";
import { STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req, ["admin", "support"]);
  if (authResult instanceof Response) return authResult;

  try {
    await connectDB();
    const tickets = await Ticket.find()
      .populate("createdBy", "name")
      .populate("assignedTo", "name")
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    const rows = tickets.map((t) => ({
      id: t._id.toString(),
      title: t.title,
      status: STATUS_LABELS[t.status as keyof typeof STATUS_LABELS] || t.status,
      priority:
        PRIORITY_LABELS[t.priority as keyof typeof PRIORITY_LABELS] || t.priority,
      category:
        CATEGORY_LABELS[t.category as keyof typeof CATEGORY_LABELS] ||
        t.category,
      createdBy:
        typeof t.createdBy === "object" && t.createdBy && "name" in t.createdBy
          ? (t.createdBy as { name: string }).name
          : "Unknown",
      assignedTo:
        typeof t.assignedTo === "object" && t.assignedTo && "name" in t.assignedTo
          ? (t.assignedTo as { name: string }).name
          : "",
      createdAt: new Date(t.createdAt).toLocaleDateString(),
    }));

    const buffer = generateTicketsPDF(rows);

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="tickets-report.pdf"',
      },
    });
  } catch (err) {
    console.error("PDF export error:", err);
    return apiError("Export failed", 500);
  }
}

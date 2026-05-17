import ActivityLog from "@/models/ActivityLog";
import { connectDB } from "./db";
import { Types } from "mongoose";

export async function logActivity(
  userId: string,
  action: string,
  entityType: "ticket" | "user" | "auth",
  entityId?: string,
  metadata?: Record<string, unknown>
) {
  await connectDB();
  await ActivityLog.create({
    userId: new Types.ObjectId(userId),
    action,
    entityType,
    entityId: entityId ? new Types.ObjectId(entityId) : undefined,
    metadata,
  });
}

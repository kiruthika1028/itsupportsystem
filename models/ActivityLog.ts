import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IActivityLog extends Document {
  userId: Types.ObjectId;
  action: string;
  entityType: "ticket" | "user" | "auth";
  entityId?: Types.ObjectId;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    entityType: {
      type: String,
      enum: ["ticket", "user", "auth"],
      required: true,
    },
    entityId: { type: Schema.Types.ObjectId },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ userId: 1 });

const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog ||
  mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);

export default ActivityLog;

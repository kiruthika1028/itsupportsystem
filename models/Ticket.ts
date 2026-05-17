import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type {
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/lib/constants";

export interface IComment {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  message: string;
  isInternal: boolean;
  createdAt: Date;
}

export interface ITicket extends Document {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  attachments: string[];
  createdBy: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  comments: IComment[];
  internalNotes?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    isInternal: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const TicketSchema = new Schema<ITicket>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "hardware",
        "software",
        "network",
        "security",
        "account_access",
        "database",
        "cloud",
        "other",
      ],
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    attachments: [{ type: String }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    comments: [CommentSchema],
    internalNotes: { type: String, default: "" },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

TicketSchema.index({ status: 1 });
TicketSchema.index({ createdBy: 1 });
TicketSchema.index({ assignedTo: 1 });
TicketSchema.index({ createdAt: -1 });
TicketSchema.index({ title: "text", description: "text" });

const Ticket: Model<ITicket> =
  mongoose.models.Ticket || mongoose.model<ITicket>("Ticket", TicketSchema);

export default Ticket;

import mongoose, { Schema, Document, Model } from "mongoose";
import type { Role } from "@/lib/constants";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  department: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["admin", "support", "employee"],
      default: "employee",
    },
    department: { type: String, required: true },
    avatar: { type: String, default: "" },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

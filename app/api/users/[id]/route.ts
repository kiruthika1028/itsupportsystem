import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { userUpdateSchema } from "@/lib/validators";
import { logActivity } from "@/lib/activity";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const authResult = await requireAuth(req);
  if (authResult instanceof Response) return authResult;
  const { user: authUser } = authResult;
  const { id } = await params;

  if (authUser.userId !== id && authUser.role === "employee") {
    return apiError("Forbidden", 403);
  }

  try {
    await connectDB();
    const user = await User.findById(id).select("-password").lean();
    if (!user) return apiError("User not found", 404);
    return apiSuccess({ user });
  } catch (err) {
    console.error("Get user error:", err);
    return apiError("Failed to fetch user", 500);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const authResult = await requireAuth(req);
  if (authResult instanceof Response) return authResult;
  const { user: authUser } = authResult;
  const { id } = await params;

  const isSelf = authUser.userId === id;
  const isAdmin = authUser.role === "admin";

  if (!isSelf && !isAdmin) return apiError("Forbidden", 403);

  try {
    const body = await req.json();
    const parsed = userUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message || "Invalid input");
    }

    if (!isAdmin && parsed.data.role) {
      return apiError("Cannot change role", 403);
    }

    await connectDB();
    const update: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.password) {
      update.password = await bcrypt.hash(parsed.data.password, 12);
    }

    const user = await User.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) return apiError("User not found", 404);

    await logActivity(authUser.userId, "updated_user", "user", id);
    return apiSuccess({ user });
  } catch (err) {
    console.error("Update user error:", err);
    return apiError("Failed to update user", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const authResult = await requireAuth(req, ["admin"]);
  if (authResult instanceof Response) return authResult;
  const { user } = authResult;
  const { id } = await params;

  if (user.userId === id) return apiError("Cannot delete yourself", 400);

  try {
    await connectDB();
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return apiError("User not found", 404);

    await logActivity(user.userId, "deleted_user", "user", id);
    return apiSuccess({ message: "User deleted" });
  } catch (err) {
    console.error("Delete user error:", err);
    return apiError("Failed to delete user", 500);
  }
}

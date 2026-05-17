import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { registerSchema } from "@/lib/validators";
import { logActivity } from "@/lib/activity";

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req, ["admin", "support"]);
  if (authResult instanceof Response) return authResult;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return apiSuccess({ users });
  } catch (err) {
    console.error("Get users error:", err);
    return apiError("Failed to fetch users", 500);
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req, ["admin"]);
  if (authResult instanceof Response) return authResult;
  const { user } = authResult;

  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message || "Invalid input");
    }

    await connectDB();
    const existing = await User.findOne({ email: parsed.data.email });
    if (existing) return apiError("Email already exists", 409);

    const hashed = await bcrypt.hash(parsed.data.password, 12);
    const newUser = await User.create({
      ...parsed.data,
      password: hashed,
    });

    await logActivity(user.userId, "created_user", "user", newUser._id.toString());

    const safe = newUser.toObject();
    delete (safe as { password?: string }).password;

    return apiSuccess({ user: safe }, 201);
  } catch (err) {
    console.error("Create user error:", err);
    return apiError("Failed to create user", 500);
  }
}

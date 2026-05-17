import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { registerSchema } from "@/lib/validators";
import { signToken } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { logActivity } from "@/lib/activity";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const limit = rateLimit(`register:${ip}`, 10, 60_000);
  if (!limit.success) return apiError("Too many requests", 429);

  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message || "Invalid input");
    }

    const { name, email, password, department, role } = parsed.data;

    if (role !== "employee") {
      return apiError("Only employee role allowed during registration", 403);
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) return apiError("Email already registered", 409);

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashed,
      department,
      role: "employee",
    });

    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    await logActivity(user._id.toString(), "registered", "auth");

    const { password: _, ...safeUser } = user.toObject();

    return apiSuccess({ user: safeUser, token }, 201);
  } catch (err) {
    console.error("Register error:", err);
    return apiError("Registration failed", 500);
  }
}

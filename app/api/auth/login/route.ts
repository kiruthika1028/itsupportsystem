import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { loginSchema } from "@/lib/validators";
import { signToken } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { logActivity } from "@/lib/activity";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const limit = rateLimit(`login:${ip}`, 20, 60_000);
  if (!limit.success) return apiError("Too many requests", 429);

  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message || "Invalid input");
    }

    const { email, password } = parsed.data;
    await connectDB();

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return apiError("Invalid email or password", 401);
    }

    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    await logActivity(user._id.toString(), "logged_in", "auth");

    const userObj = user.toObject();
    delete (userObj as { password?: string }).password;

    return apiSuccess({ user: userObj, token });
  } catch (err) {
    console.error("Login error:", err);
    return apiError("Login failed", 500);
  }
}

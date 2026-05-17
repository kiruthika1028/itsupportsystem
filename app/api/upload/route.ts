import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireAuth } from "@/lib/api-auth";
import { apiSuccess, apiError } from "@/lib/api-response";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
];

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof Response) return authResult;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return apiError("No file provided");

    if (file.size > MAX_SIZE) return apiError("File too large (max 5MB)");
    if (!ALLOWED_TYPES.includes(file.type)) {
      return apiError("File type not allowed");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name) || ".bin";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    return apiSuccess({ url: `/uploads/${filename}`, filename });
  } catch (err) {
    console.error("Upload error:", err);
    return apiError("Upload failed", 500);
  }
}

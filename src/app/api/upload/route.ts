import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { uploadFile, BUCKET_NAME } from "@/lib/supabase";

/** 
 * POST /api/upload
 * Accepts multipart/form-data with:
 *   - file: the image file
 *   - folder: e.g. "clients/{clientId}/assessments" or "clients/{clientId}/checkins"
 *   - label: e.g. "front", "back", "side_left", "side_right"
 * Returns { url, label, path }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string | null;
    const label = formData.get("label") as string | "photo";

    if (!file || !folder) {
      return NextResponse.json({ error: "Ficheiro e pasta são obrigatórios" }, { status: 400 });
    }

    // Validate file type
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de ficheiro não suportado. Use JPG, PNG ou WebP." }, { status: 400 });
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Ficheiro demasiado grande. Máximo 5MB." }, { status: 400 });
    }

    // Build unique path
    const ext = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const path = `${folder}/${label}_${timestamp}.${ext}`;

    // Upload
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadFile(BUCKET_NAME, path, buffer, file.type);

    return NextResponse.json({ url, label: label || "photo", path });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Erro ao fazer upload" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { uploadFile, BUCKET_NAME } from "@/lib/supabase";
import sharp from "sharp";

const MAX_DIMENSION = 1920;
const QUALITY = 80;

/** 
 * POST /api/upload
 * Accepts multipart/form-data with:
 *   - file: the image file
 *   - folder: e.g. "clients/{clientId}/assessments" or "clients/{clientId}/checkins"
 *   - label: e.g. "front", "back", "side_left", "side_right"
 * Returns { url, label, path }
 * 
 * Images are automatically compressed to WebP (max 1920px, 80% quality).
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

    // Max 10MB raw (will be compressed)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Ficheiro demasiado grande. Máximo 10MB." }, { status: 400 });
    }

    // Compress & resize to WebP
    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const compressed = await sharp(rawBuffer)
      .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer();

    // Build unique path (always .webp now)
    const timestamp = Date.now();
    const path = `${folder}/${label}_${timestamp}.webp`;

    // Upload compressed image
    const url = await uploadFile(BUCKET_NAME, path, compressed, "image/webp");

    return NextResponse.json({ url, label: label || "photo", path });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Erro ao fazer upload" }, { status: 500 });
  }
}

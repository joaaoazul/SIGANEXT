import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadFile, BUCKET_NAME } from "@/lib/supabase";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import sharp from "sharp";
import { logger } from "@/lib/logger";

const MAX_DIMENSION = 1920;
const QUALITY = 80;

export async function POST(request: NextRequest) {
  try {
    // Rate limit onboarding uploads: 20 per hour per IP
    const ip = getClientIP(request);
    const rl = await rateLimit(`onboarding-upload:${ip}`, { max: 20, windowSecs: 60 * 60 });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Demasiados uploads. Tente novamente mais tarde." },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const inviteId = formData.get("inviteId") as string | null;
    const label = formData.get("label") as string || "photo";

    if (!inviteId) {
      return NextResponse.json({ error: "inviteId é obrigatório" }, { status: 400 });
    }

    // Validate invite ID format (must be valid CUID)
    if (!/^[a-z0-9]{20,30}$/.test(inviteId)) {
      return NextResponse.json({ error: "Convite inválido" }, { status: 403 });
    }

    // Validate invite instead of JWT
    const invite = await prisma.invite.findUnique({ where: { id: inviteId } });
    if (!invite || invite.status !== "pending") {
      return NextResponse.json({ error: "Convite inválido" }, { status: 403 });
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Ficheiro não enviado" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de ficheiro não suportado" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Ficheiro demasiado grande (máx 5MB)" }, { status: 400 });
    }

    // Sanitize label to prevent path injection
    const safeLabel = label.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 50) || "photo";

    // Compress to WebP like the main upload route (prevents serving malicious files)
    const rawBuffer = Buffer.from(await (file as Blob).arrayBuffer());
    const compressed = await sharp(rawBuffer)
      .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer();

    const folder = `onboarding/${inviteId}`;
    const path = `${folder}/${safeLabel}_${Date.now()}.webp`;

    const url = await uploadFile(BUCKET_NAME, path, compressed, "image/webp");

    return NextResponse.json({ url, label: safeLabel, path });
  } catch (error) {
    logger.exception("Onboarding upload error", error);
    return NextResponse.json({ error: "Erro ao fazer upload" }, { status: 500 });
  }
}

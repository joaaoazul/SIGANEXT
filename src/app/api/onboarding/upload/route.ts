import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadFile, BUCKET_NAME } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const inviteId = formData.get("inviteId") as string | null;
    const label = formData.get("label") as string || "photo";

    if (!inviteId) {
      return NextResponse.json({ error: "inviteId é obrigatório" }, { status: 400 });
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

    const ext = file.name.split(".").pop() || "jpg";
    const folder = `onboarding/${inviteId}`;
    const path = `${folder}/${label}_${Date.now()}.${ext}`;

    const buffer = Buffer.from(await (file as Blob).arrayBuffer());
    const url = await uploadFile(BUCKET_NAME, path, buffer, file.type);

    return NextResponse.json({ url, label, path });
  } catch (error) {
    console.error("Onboarding upload error:", error);
    return NextResponse.json({ error: "Erro ao fazer upload" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getUser, getClientId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeFilePath } from "@/lib/security";

const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME || "siganext-uploads";

// Cache control: images are immutable (filename has timestamp)
const CACHE_HEADER = "public, max-age=31536000, immutable";

/**
 * GET /api/files/[...path]
 * Authenticated proxy to serve files from Cloudflare R2.
 * Includes path traversal prevention and ownership verification.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // ── Authentication required ──
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { path } = await params;
    const key = path.join("/");

    if (!key) {
      return NextResponse.json({ error: "Path não especificado" }, { status: 400 });
    }

    // ── Path traversal prevention ──
    const safePath = sanitizeFilePath(key);
    if (!safePath) {
      return NextResponse.json({ error: "Caminho inválido" }, { status: 400 });
    }

    // ── Ownership verification ──
    // Files under clients/{clientId}/... require ownership check
    const pathParts = safePath.split("/");
    if (pathParts[0] === "clients" && pathParts[1]) {
      const resourceClientId = pathParts[1];

      if (user.role === "client") {
        // Athletes can only access their own files
        const clientId = await getClientId(user);
        if (clientId !== resourceClientId) {
          return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
        }
      } else if (user.role === "admin" || user.role === "employee") {
        // PTs can only access files of their managed clients
        const client = await prisma.client.findFirst({
          where: { id: resourceClientId, managerId: user.id },
          select: { id: true },
        });
        if (!client) {
          return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
        }
      }
      // superadmin can access all files
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: safePath,
    });

    const response = await S3.send(command);

    if (!response.Body) {
      return NextResponse.json({ error: "Ficheiro não encontrado" }, { status: 404 });
    }

    // Convert readable stream to Buffer
    const bytes = await response.Body.transformToByteArray();
    const buffer = Buffer.from(bytes);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": response.ContentType || "application/octet-stream",
        "Content-Length": String(buffer.length),
        "Cache-Control": CACHE_HEADER,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: any) {
    if (error.name === "NoSuchKey" || error.Code === "NoSuchKey") {
      return NextResponse.json({ error: "Ficheiro não encontrado" }, { status: 404 });
    }
    console.error("File proxy error:", error?.message || error);
    return NextResponse.json({ error: "Erro ao servir ficheiro" }, { status: 500 });
  }
}

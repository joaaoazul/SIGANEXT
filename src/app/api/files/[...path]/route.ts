import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

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
 * Proxy to serve files from Cloudflare R2.
 * This avoids needing a public R2 URL or custom domain.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const key = path.join("/");

    if (!key) {
      return NextResponse.json({ error: "Path não especificado" }, { status: 400 });
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
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

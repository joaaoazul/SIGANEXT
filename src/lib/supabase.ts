import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// ============================================================================
// 1. CLIENTE SUPABASE ORIGINAL (Mantido para não quebrar BD/Auth no resto da app)
// ============================================================================
let _supabase: SupabaseClient | null = null;
export function getSupabase() {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY!;
    _supabase = createClient(supabaseUrl, supabaseKey);
  }
  return _supabase;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabase() as any)[prop];
  },
});


// ============================================================================
// 2. INTEGRAÇÃO CLOUDFLARE R2 (Novo Storage de Ficheiros)
// ============================================================================
const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const BUCKET_NAME = "siganext-uploads"; // Nome do bucket criado no painel da Cloudflare

/**
 * Upload a file to Cloudflare R2 and return the public URL.
 * path: e.g. "clients/{clientId}/assessments/{assessmentId}/front.jpg"
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: path,
    Body: file,
    ContentType: contentType,
  });

  // Envia para o R2
  await S3.send(command);

  // Se existir um R2 public URL (r2.dev ou custom domain), usa-o diretamente
  // Caso contrário, usa o proxy interno /api/files/
  const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (r2PublicUrl) {
    return `${r2PublicUrl}/${path}`;
  }
  
  // URL relativo — funciona em qualquer ambiente (dev, prod, etc.)
  return `/api/files/${path}`;
}

/**
 * Delete a file from Cloudflare R2.
 */
export async function deleteFile(bucket: string, path: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: path,
    });
    
    await S3.send(command);
  } catch (error: any) {
    console.error("Delete file error:", error.message);
  }
}
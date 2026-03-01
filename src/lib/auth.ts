import { sign, verify, JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET environment variable is required");

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function signToken(payload: UserPayload): string {
  return sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    const decoded = verify(token, JWT_SECRET) as JwtPayload & UserPayload;
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

export async function getUser(_request?: unknown): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * For client-role users, resolves the actual Client.id.
 * Handles old JWTs that may contain User.id instead of Client.id.
 */
export async function getClientId(user: UserPayload): Promise<string> {
  // Check if user.id is already a Client.id
  const client = await prisma.client.findUnique({
    where: { id: user.id },
    select: { id: true },
  });
  if (client) return client.id;

  // Fallback: old JWT with User.id — resolve via email
  const clientByEmail = await prisma.client.findUnique({
    where: { email: user.email },
    select: { id: true },
  });
  if (clientByEmail) return clientByEmail.id;

  // Last resort: return user.id as-is
  return user.id;
}

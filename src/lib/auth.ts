import { sign, verify, JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "siga180-secret-key-change-in-production";

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

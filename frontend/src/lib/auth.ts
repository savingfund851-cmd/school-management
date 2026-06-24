import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "school-mgmt-super-secret-key-123456";

export interface JWTPayload {
  userId: string;
  email: string;
  role: "superadmin" | "admin" | "teacher" | "student";
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// In Next.js App Router, request headers or cookies can be read to verify auth
export async function getAuthUser(req: NextRequest): Promise<JWTPayload | null> {
  // Try to read from cookie first (recommended)
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (token) {
    return verifyToken(token);
  }

  // Fallback to Authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const bearerToken = authHeader.split(" ")[1];
    return verifyToken(bearerToken);
  }

  return null;
}

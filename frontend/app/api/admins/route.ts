import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";
import { verifyToken } from "@/src/lib/auth";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

async function getSuperAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || payload.role !== "superadmin") return null;
  return payload;
}

export async function GET(req: Request) {
  try {
    if (!(await getSuperAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const admins = await db.user.findMany({
      where: { role: "admin" },
      select: { id: true, email: true, createdAt: true, permissions: true },
    });

    return NextResponse.json(admins);
  } catch (err: any) {
    console.error("GET /api/admins error:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await getSuperAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { email, password, permissions } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: `An account with email "${email}" already exists. Use the Edit button on that account to update their permissions.` },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newAdmin = await db.user.create({
      data: {
        email,
        passwordHash,
        role: "admin",
        permissions: permissions && permissions.length > 0 ? JSON.stringify(permissions) : null,
      },
      select: { id: true, email: true, createdAt: true, permissions: true },
    });

    return NextResponse.json(newAdmin);
  } catch (err: any) {
    console.error("POST /api/admins error:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    if (!(await getSuperAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, permissions } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Admin ID required" }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id },
      data: {
        permissions: permissions && permissions.length > 0 ? JSON.stringify(permissions) : null,
      },
      select: { id: true, email: true, createdAt: true, permissions: true },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PUT /api/admins error:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!(await getSuperAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await db.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/admins error:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

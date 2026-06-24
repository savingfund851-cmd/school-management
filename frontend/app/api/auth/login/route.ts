import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken } from "@/src/lib/auth"; // Note path prefix
import { db } from "@/src/lib/db";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
      include: {
        teacher: true,
        student: true,
      },
    }) as any;

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Sign JWT Token
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role as "superadmin" | "admin" | "teacher" | "student",
    };
    const token = signToken(payload);

    // Create response
    const response = NextResponse.json({
      message: "Login successful.",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.teacher?.name || user.student?.name || (user.role === "superadmin" ? "Super Admin" : "Administrator"),
      },
    });

    // Set cookie using native NextResponse cookie options
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day in seconds
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

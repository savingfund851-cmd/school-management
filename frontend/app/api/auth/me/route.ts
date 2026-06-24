import { NextResponse } from "next/server";
import { getAuthUser } from "@/src/lib/auth";
import { db } from "@/src/lib/db";

export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser(req as any);
    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Load full user details
    const user = await db.user.findUnique({
      where: { id: authUser.userId },
      include: {
        teacher: true,
        student: true,
      },
    }) as any;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const name = user.teacher?.name || user.student?.name || "Administrator";
    const profileId = user.teacher?.id || user.student?.id || null;

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        profileId,
        email: user.email,
        role: user.role,
        name,
        permissions: user.permissions ? JSON.parse(user.permissions) : [],
      },
    });
  } catch (error: any) {
    console.error("Get Auth Me Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

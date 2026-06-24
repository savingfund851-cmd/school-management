import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/src/lib/auth";
import { db } from "@/src/lib/db";

// GET: Attendance list for a specific student
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const authUser = await getAuthUser(req as any);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { studentId } = await params;

    // Authorization checks:
    // Admin & Teacher can view any student's attendance.
    // Students can only view their own attendance.
    if (authUser.role === "student") {
      const studentProfile = await db.student.findUnique({
        where: { userId: authUser.userId },
      });
      if (!studentProfile || studentProfile.id !== studentId) {
        return NextResponse.json(
          { error: "Access denied. You can only view your own attendance." },
          { status: 403 }
        );
      }
    }

    const attendance = await db.attendance.findMany({
      where: { studentId },
      include: {
        class: true,
        markedBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(attendance);
  } catch (error: any) {
    console.error("Get Student Attendance Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

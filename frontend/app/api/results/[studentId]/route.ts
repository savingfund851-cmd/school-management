import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/src/lib/auth";
import { db } from "@/src/lib/db";

// GET: Exam results for a specific student
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

    // Authorization: Students can only access their own profile
    if (authUser.role === "student") {
      const studentProfile = await db.student.findUnique({
        where: { userId: authUser.userId },
      });
      if (!studentProfile || studentProfile.id !== studentId) {
        return NextResponse.json(
          { error: "Access denied. You can only view your own results." },
          { status: 403 }
        );
      }
    }

    const results = await db.result.findMany({
      where: { studentId },
      include: {
        exam: {
          include: {
            class: true,
          },
        },
      },
      orderBy: { exam: { examDate: "desc" } },
    });

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Get Student Results Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

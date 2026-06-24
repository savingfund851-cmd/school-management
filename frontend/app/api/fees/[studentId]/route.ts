import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/src/lib/auth";
import { db } from "@/src/lib/db";

// GET: Fee payment details for a specific student
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

    // Authorization check
    if (authUser.role === "student") {
      const studentProfile = await db.student.findUnique({
        where: { userId: authUser.userId },
      });
      if (!studentProfile || studentProfile.id !== studentId) {
        return NextResponse.json(
          { error: "Access denied. You can only view your own fee status." },
          { status: 403 }
        );
      }
    }

    const fees = await db.fee.findMany({
      where: { studentId },
      orderBy: { dueDate: "desc" },
    });

    return NextResponse.json(fees);
  } catch (error: any) {
    console.error("Get Student Fees Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

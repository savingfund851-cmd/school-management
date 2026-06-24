import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/src/lib/auth";
import { db } from "@/src/lib/db";

// GET: Fetch attendance for a specific class and date
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const date = searchParams.get("date");

    if (!classId || !date) {
      return NextResponse.json({ error: "classId and date required" }, { status: 400 });
    }

    const attendance = await db.attendance.findMany({
      where: { classId, date },
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Get Attendance Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}


// POST: Mark student-wise attendance (Teacher only)
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser(req as any);
    if (!authUser || authUser.role !== "teacher") {
      return NextResponse.json(
        { error: "Unauthorized. Teacher access only." },
        { status: 403 }
      );
    }

    // Find teacher record associated with authenticated user
    const teacher = await db.teacher.findUnique({
      where: { userId: authUser.userId },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher profile not found." },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { classId, date, records } = body; // records: [{ studentId: string, status: "present" | "absent" | "late" }]

    if (!classId || !date || !records || !Array.isArray(records)) {
      return NextResponse.json(
        { error: "Required fields classId, date, and records array are missing." },
        { status: 400 }
      );
    }

    // Clear any existing attendance for this class and date
    await db.$transaction(async (tx) => {
      await tx.attendance.deleteMany({
        where: {
          classId: classId,
          date: date,
        },
      });

      // Create new records
      for (const rec of records) {
        await tx.attendance.create({
          data: {
            studentId: rec.studentId,
            classId: classId,
            date: date,
            status: rec.status,
            markedById: teacher.id,
          },
        });
      }
    });

    return NextResponse.json({
      message: "Attendance records saved successfully.",
    });
  } catch (error: any) {
    console.error("Save Attendance Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

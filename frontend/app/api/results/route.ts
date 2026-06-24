import { NextResponse, NextRequest } from "next/server";
import { db } from "@/src/lib/db";
import { getAuthUser } from "@/src/lib/auth";

// GET: Public results — home page search
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const examId = searchParams.get("examId");

    if (!classId && !examId) {
      const exams = await db.exam.findMany({
        include: { class: { select: { id: true, name: true, section: true } } },
        orderBy: { examDate: "desc" },
        take: 50,
      });
      return NextResponse.json(exams);
    }

    const whereClause: any = {};
    if (examId) whereClause.examId = examId;
    else if (classId) whereClause.exam = { classId };

    const results = await db.result.findMany({
      where: whereClause,
      include: {
        student: { select: { name: true, rollNo: true } },
        exam: { include: { class: { select: { name: true, section: true } } } },
      },
      orderBy: { marksObtained: "desc" },
    });

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Get Results Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// POST: Save/update a result (Admin, SuperAdmin, Teacher)
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser(req as any);
    if (!authUser || !["admin", "superadmin", "teacher"].includes(authUser.role)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const body = await req.json();
    const { examId, studentId, marksObtained, grade, remarks } = body;

    if (!examId || !studentId || marksObtained === undefined || !grade) {
      return NextResponse.json({ error: "Required fields missing." }, { status: 400 });
    }

    // Upsert: update if exists, else create
    const existing = await db.result.findFirst({ where: { examId, studentId } });

    let result;
    if (existing) {
      result = await db.result.update({
        where: { id: existing.id },
        data: { marksObtained: parseFloat(marksObtained), grade, remarks: remarks || "" },
      });
    } else {
      result = await db.result.create({
        data: {
          examId,
          studentId,
          marksObtained: parseFloat(marksObtained),
          grade,
          remarks: remarks || "",
        },
      });
    }

    return NextResponse.json({ message: "Result saved.", result });
  } catch (error: any) {
    console.error("Save Result Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// DELETE: Delete a result
export async function DELETE(req: Request) {
  try {
    const authUser = await getAuthUser(req as any);
    if (!authUser || !["admin", "superadmin"].includes(authUser.role)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }
    const { id } = await req.json();
    await db.result.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

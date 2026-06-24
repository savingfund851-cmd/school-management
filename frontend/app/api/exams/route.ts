import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/src/lib/auth";
import { db } from "@/src/lib/db";

// GET: Fetch all exams (optionally filtered by classId)
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    const whereClause: any = {};
    if (classId) {
      whereClause.classId = classId;
    }

    const exams = await db.exam.findMany({
      where: whereClause,
      include: {
        class: {
          select: { name: true }
        }
      },
      orderBy: { examDate: "desc" }
    });

    return NextResponse.json(exams);
  } catch (error) {
    console.error("Get Exams Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// POST: Create a new exam
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser(req as any);
    if (!authUser || (authUser.role !== "admin" && authUser.role !== "teacher" && authUser.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized. Staff only." }, { status: 403 });
    }

    const body = await req.json();
    const { name, classId, subject, examDate, totalMarks, academicYear } = body;

    if (!name || !classId || !subject || !examDate || !totalMarks || !academicYear) {
      return NextResponse.json({ error: "Required fields missing." }, { status: 400 });
    }

    const exam = await db.exam.create({
      data: {
        name,
        classId,
        subject,
        examDate: new Date(examDate),
        totalMarks: parseInt(totalMarks),
        academicYear
      }
    });

    return NextResponse.json({ message: "Exam created successfully.", exam }, { status: 201 });
  } catch (error) {
    console.error("Create Exam Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

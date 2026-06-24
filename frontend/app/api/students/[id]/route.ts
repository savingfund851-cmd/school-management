import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/src/lib/auth";
import { db } from "@/src/lib/db";

// PUT: Update student profile (Admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(req as any);
    if (!authUser || authUser.role !== "admin" && authUser.role !== "superadmin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const student = await db.student.findUnique({ where: { id } });
    if (!student) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    // Update details
    const updatedStudent = await db.student.update({
      where: { id },
      data: {
        name: body.name,
        rollNo: body.rollNo,
        classId: body.classId,
        section: body.section,
        dob: body.dob,
        gender: body.gender,
        guardianName: body.guardianName,
        guardianPhone: body.guardianPhone,
        address: body.address,
        photoUrl: body.photoUrl,
        status: body.status,
      },
      include: {
        class: true,
      },
    });

    return NextResponse.json({
      message: "Student updated successfully.",
      student: updatedStudent,
    });
  } catch (error: any) {
    console.error("Update Student Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// DELETE: Remove student and user account (Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(req as any);
    if (!authUser || authUser.role !== "admin" && authUser.role !== "superadmin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const student = await db.student.findUnique({ where: { id } });
    if (!student) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    // Delete Student and User in a transaction
    await db.$transaction([
      db.student.delete({ where: { id } }),
      db.user.delete({ where: { id: student.userId } }),
    ]);

    return NextResponse.json({ message: "Student deleted successfully." });
  } catch (error: any) {
    console.error("Delete Student Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

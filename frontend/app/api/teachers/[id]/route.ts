import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/src/lib/auth";
import { db } from "@/src/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== "admin" && authUser.role !== "superadmin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const { id } = await params;

    // First find the teacher to get the userId
    const teacher = await db.teacher.findUnique({
      where: { id },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found." },
        { status: 404 }
      );
    }

    // Delete the user (this will cascade to teacher due to onDelete: Cascade in schema)
    await db.user.delete({
      where: { id: teacher.userId },
    });

    return NextResponse.json({ message: "Teacher deleted successfully." });
  } catch (error: any) {
    console.error("Delete Teacher Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

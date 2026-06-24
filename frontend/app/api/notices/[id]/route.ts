import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/src/lib/auth";
import { db } from "@/src/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || (authUser.role !== "admin" && authUser.role !== "teacher" && authUser.role !== "superadmin")) {
      return NextResponse.json(
        { error: "Unauthorized. Staff privileges required." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const notice = await db.notice.findUnique({
      where: { id },
    });

    if (!notice) {
      return NextResponse.json(
        { error: "Notice not found." },
        { status: 404 }
      );
    }

    // Only allow deletion if admin OR if the teacher is the publisher
    if (authUser.role !== "admin" && notice.publishedById !== authUser.userId) {
       return NextResponse.json(
        { error: "Forbidden. You can only delete your own notices." },
        { status: 403 }
      );
    }

    await db.notice.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Notice deleted successfully." });
  } catch (error: any) {
    console.error("Delete Notice Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

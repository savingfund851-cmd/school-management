import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/src/lib/auth";
import { db } from "@/src/lib/db";

// PATCH: Approve/Reject admission application (Admin only)
export async function PATCH(
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
    const { status } = body; // "approved" | "rejected"

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value. Must be 'approved' or 'rejected'." },
        { status: 400 }
      );
    }

    const admission = await db.admission.findUnique({ where: { id } });
    if (!admission) {
      return NextResponse.json(
        { error: "Admission application not found." },
        { status: 404 }
      );
    }

    const updatedAdmission = await db.admission.update({
      where: { id },
      data: {
        status,
        reviewedById: authUser.userId,
      },
    });

    return NextResponse.json({
      message: `Admission application status updated to ${status}.`,
      admission: updatedAdmission,
    });
  } catch (error: any) {
    console.error("Update Admission Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
